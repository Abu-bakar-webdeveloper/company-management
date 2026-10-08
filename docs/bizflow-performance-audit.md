# BizFlow performance audit — slow hub & performance pages

Scope: `server/src/features/{projects,tasks,performance}/*.service.ts`, `server/src/db/connect.ts`, `client/src/features/hubs/*`, `client/src/app/router.tsx`, `client/src/shared/api/queryClient.ts`

## Evidence from your Network tab

Your screenshot is the key clue: every request — `me`, `stats`, `dashboard`, `users`, `requests`, `logout` — returns **0.1–0.9 kB** but takes **1–7 seconds**. That combination (tiny payload, big latency, and it's uniform across totally unrelated endpoints) rules out "one slow query" and points at something systemic: either connection overhead paid on every request, or several endpoints independently doing more round trips than they need to. Both turned out to be true.

## Backend: confirmed N+1 query patterns

### 1. `getTaskProgress` — sequential, one query per month
**File:** `server/src/features/tasks/task.service.ts`, lines 869-892

```
for (let i = months - 1; i >= 0; i -= 1) {
  ...
  const completed = await Task.countDocuments({ ...filter, updatedAt: { $gte: start, $lt: end } })
  series.push({ month: label, completed })
}
```

This is the trend-chart data behind `TaskCompletionTrendChart` on your hub pages. For a 6-month window it fires **6 sequential database round trips** — not parallel, each `await` blocks the next iteration. If each round trip costs even 150-300ms (normal for a remote Atlas cluster), that's 1-2 seconds on this one widget alone.

**Fix:** replace the loop with a single aggregation:
```js
const rows = await Task.aggregate([
  { $match: filter },
  { $match: { updatedAt: { $gte: rangeStart, $lt: rangeEnd } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }, completed: { $sum: 1 } } },
])
```
Then map the 6 buckets onto your month labels in JS. One round trip instead of six.

### 2. `getProjectOverview` — same pattern
**File:** `server/src/features/projects/project.service.ts`, lines 311-360

Same structure: a `for` loop over months, with `Promise.all` of 2 counts *inside* each iteration — so it's parallel per-month but still sequential *across* months. 6 months = 6 sequential round trips (12 queries total). Same fix: collapse into one or two `$group`-by-month aggregations.

### 3. `listReviewCycles` — one query per review cycle
**File:** `server/src/features/performance/performance-extended.service.ts`, lines 90-106

```js
const cycles = await ReviewCycle.find({ companyId: acting.companyId })...
return Promise.all(cycles.map(async (cycle) => {
  const stats = await cycleCompletion(acting.companyId, cycle)
  ...
}))
```

This is likely your specific "performance page is slow" complaint. For a company with 12 review cycles (e.g. monthly), loading the page fires 1 + 12 = 13 queries, each of which (`cycleCompletion`) itself runs 2 counts — so ~25 total queries for one page. At least this one is parallelized (`Promise.all`), so it's less bad than #1/#2, but it's still N+1 shaped and will get slower as review cycles accumulate.

**Fix:** compute completion stats for *all* cycles in one aggregation grouped by `cycleId`, then map results back onto the cycle list, instead of querying per cycle.

### 4. Indexes don't match the queries being run
**Files:** `task.model.ts`, `project.model.ts`

- Task has a compound index on `{ companyId, status, completedAt }`, but `getTaskProgress` filters on `updatedAt`, not `completedAt` — the index doesn't cover the query it's actually meant to speed up.
- Project has no index covering `{ companyId, status, updatedAt }`, which is exactly the filter `getProjectOverview`'s second count uses.

**Fix:** add `{ companyId: 1, status: 1, updatedAt: 1 }` on both, or standardize on one "completion timestamp" field instead of mixing `completedAt`/`updatedAt`.

## Backend: connection overhead (needs your confirmation)

`server/src/db/connect.ts` caches the Mongo connection in a module-level variable across warm invocations — that's the *correct* serverless pattern. But it only helps if requests land on the same warm container. **I couldn't confirm where this server is actually deployed** (no `api/index.ts` entrypoint or hosting config in the zip, just a bare `vercel.json`). If it's on Vercel serverless (or similar), firing 5-6 parallel requests from one hub page — which is exactly what happens today — can hit 5-6 *different* cold containers simultaneously, each independently paying MongoDB's TLS + auth handshake (roughly 0.5-2s). That would explain uniformly slow, tiny-payload responses across every endpoint, including trivial ones like `me` and `logout`.

**Please confirm:** where is the server actually hosted, and is it Vercel serverless, a persistent Node process (Railway/Render/EC2/etc.), or something else? That answer determines whether the fix is "reduce concurrent cold starts" (serverless) or "look at the process/DB directly" (persistent server). If it is serverless, cutting the hub page down to fewer, combined requests (next section) directly reduces how often this happens.

## Frontend: no code splitting at all

**File:** `client/src/app/router.tsx` (694 lines, zero `React.lazy` calls)

Every route — every hub, every module, projects, tasks, performance, KPIs, settings — is imported eagerly and bundled into one JS chunk. A user opening the Delivery hub downloads and parses the code for the entire app, not just that page. This hits *every* page load, not just heavy ones, and gets worse as you add more features.

**Fix:** wrap each route's page component in `React.lazy()` + `<Suspense>` in the router. This is usually a highly mechanical change with Vite (it already code-splits on dynamic `import()` automatically) and often cuts initial bundle size dramatically with no logic changes.

## Frontend: hub pages fan out into 5-7 parallel requests

**File:** `client/src/features/hubs/pages/WorkHubPage.tsx` (and similarly the other hub pages)

`WorkHubPage` alone fires `projects/stats`, `projects?page=1&limit=20`, `tasks/stats`, `projects/milestones/stats`, `clients/stats`, plus `TaskCompletionTrendChart`'s own `tasks/progress` call — six independent round trips on every load. This isn't wrong (they're parallel, not sequential, and react-query dedupes the one shared `projects/stats` key with `ProjectStatusDonut`), but each one is a full HTTP + auth + DB round trip. Combined with the backend issues above, it multiplies your exposure to both the N+1 loops and any cold-start overhead.

**Fix (medium-effort, biggest win for hub pages specifically):** add one combined `GET /hubs/work-summary` endpoint that runs all five underlying queries server-side (still in parallel with `Promise.all`, but as one HTTP round trip from the client) and returns a single payload. This cuts client-perceived load time roughly in proportion to how much of it is round-trip/auth overhead vs. actual query time — likely significant given your Network tab shows mostly-overhead-sized responses.

## Priority order

1. Fix `getTaskProgress` and `getProjectOverview` loops → single aggregation each. Small, isolated, high-confidence win, directly explains slow trend charts.
2. Fix `listReviewCycles` → grouped aggregation instead of per-cycle queries. Directly targets the performance page complaint.
3. Confirm hosting and, if serverless, consolidate hub-page requests into fewer combined endpoints.
4. Add the missing/mismatched indexes.
5. Add route-level code splitting (`React.lazy`) — bigger effort, but improves every page, not just hubs/performance.

Items 1 and 2 are the most defensible "yes, this is definitely slowing you down" findings — they're structural, visible in the code, and independent of hosting. Start there.
