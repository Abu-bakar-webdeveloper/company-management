# In-House Planning App — IA & Page Content Plan (v2)

Revised architecture based on how this is actually meant to work as a SaaS
product for a demo: **Dashboard = overall cross-company snapshot, Hub =
domain charts/graphs command-center, Module page = stat cards + operational
table.** This replaces v1's "strip the dashboard to a thin action list" —
that was too aggressive. The real fix is not "show less," it's "show the
right depth in the right place, once."

---

## 0. The model

| Layer | Job | Contains |
|---|---|---|
| **Dashboard** (`/dashboard`, role-based) | Overall company/self snapshot across every domain, at a glance | Cross-domain stat cards (one headline number per domain: People/Finance/Work) + a merged action/decision feed + activity log. **No deep charts** — those belong to the hub. |
| **Hub** (`/people`, `/finance`, `/work`) | The domain's command-center — this is where you *understand* the domain | Domain stat cards (deeper than dashboard's single number) + **graphs and charts** (trends, mixes, heatmaps, distributions) + decision lists |
| **Module page** (`/projects`, `/attendance`, `/expenses`, etc.) | Where you *work* the records for that domain | Stat cards relevant to that specific page (compact, can repeat the hub's numbers at page scope — that's fine, it's not duplication, it's the same number in its natural working context) + the operational table/list/board. Charts only if the page needs analysis genuinely deeper than what the hub shows (e.g. a trend-over-many-cycles chart) — not a repeat of the hub's summary chart. |
| **Reports** (`/reports`) | Formal export over a chosen time range | Period-based, historical — not a live snapshot |

**What actually counts as "repeat" to fix:** the *same chart component*
rendered on two pages showing the *same summary*. Example: `ExpenseSummaryChart`
currently renders on both `AdminDashboardPage` and `FinanceHubPage` —
literally the same component, same data, same view, twice. That's the
problem. A stat card showing "24 expenses" on both the Finance hub and the
Expenses list page is **not** a problem — it's the same fact shown at two
natural altitudes (domain overview vs. working the list), which is normal
and expected in a SaaS product.

---

## 1. UI consistency system (unchanged from v1 — still correct)

- One `StatCard` component app-wide (not five near-duplicates: `HubStatsRow`'s
  card, `StatCard`, `MetricStatCard`, `EmployeeSummaryStatCard`, and every
  module's own `*StatsRow`). Same card, used at dashboard/hub/module scope
  with a `size` prop if needed.
- One breakdown/mix component (`HubBreakdownCard`, with a `variant="donut"`
  option) instead of `ClockInStatusDonut`, `ProjectStatusDonut`,
  `RevenueDonutChart`, `TasksStatusDonut` as separate one-off components.
- One decision-list component (`HubDecisionCard`) for every "this needs
  action" list app-wide: pending leave, pending expenses, delayed projects,
  overdue tasks, at-risk clients.
- Keep the existing color language exactly as-is everywhere: green = good,
  amber = pending/attention, red = risk/overdue, purple = performance/people,
  primary blue = neutral.
- `HubPageHeader` pattern (title + one-line "what decision this helps you
  make" subtitle) on Dashboard, every hub, and every module list page.

---

## 2. Sidebar / naming / route cleanup (do first, zero risk)

1. `navigation.ts` — the `work` group has `label: 'Projects'`. Rename to
   `'Work'` so sidebar text, hub title, and the `/work` URL all agree.
2. Redirect `/performance/analytics` → `/performance` (your own code already
   flags it as legacy).
3. **Remove `PerformanceListPage` (`/performance/list`).** The People hub
   shows the performance spotlight, and `PerformanceDashboardPage`
   (admin/hr view of `/performance`) already renders `TopPerformersTable` +
   `AdminCompanyHubSections`. A third, separate filterable
   list-of-all-performance-records page is the exact kind of redundant page
   you're describing — fold its filter/search behavior into
   `PerformanceDashboardPage`'s table instead of keeping a standalone page.

---

## 3. Dashboard — overall snapshot, all domains, no deep charts

**Keep as a real overview** (this reverses v1's "strip it down" — you're
right that a SaaS dashboard should feel substantial, not empty):

- Header + greeting.
- **Cross-domain stat-card row**: one headline number per domain —
  Employees/Team, Projects active, Payroll this month, Pending approvals —
  using the *same* `StatCard` component the hubs use, just fewer cards and
  higher-level numbers (company totals, not the domain's full breakdown).
- **Merged action/decision feed** — pending leave + pending expenses +
  reviews due + overdue tasks, one list, sorted by urgency, using
  `HubDecisionCard`. Replaces having a separate `PendingLeaveTable` and
  `RecentLeaveTable` and per-domain approval widgets scattered across the
  page.
- **Recent activity feed** (`RecentActivities`) — keep, this is genuinely
  dashboard-native (a live log), doesn't exist anywhere else.
- **Attendance clock-in/out widget** for self — keep, it's an action.

**Remove — because these are the literal duplicate chart components that
also render on a hub:**
- `ExpenseSummaryChart` (also on Finance hub) → dashboard keeps only the
  payroll/expense *stat card*, chart lives on Finance hub only.
- `ProjectOverviewChart` and `ProjectStatusDonut` (Work hub already has
  `ProjectStatusDonut`) → dashboard keeps only the projects *stat card*.
- `PerformanceOverview` / `TopPerformersCard` (People hub already has the
  performance spotlight decision card) → dashboard keeps only the
  reviews-due *stat card*.
- `PayrollOverviewCard` (HR dashboard) → this is a full duplicate of the
  Finance hub's payroll snapshot — remove entirely from Dashboard.
- `TeamWorkloadChart` (Manager dashboard) → this is a genuine *chart*, so it
  moves to the People hub (see §4), not deleted — dashboard keeps a single
  "team workload: healthy/overloaded" stat card at most.
- `WorkProgressChart`, `TasksStatusDonut` (Employee/HR dashboard) → move to
  the Work hub's personal/task view (see §6); dashboard keeps just "3 tasks
  due this week" as a stat card.

The pattern throughout: **the number stays on Dashboard as a stat card, the
chart that explains that number moves to (or stays on) the hub.**

---

## 4. People Hub (`/people`) — add the charts that are currently trapped in module pages

**Keep (already correct):** stat-card row (Employees/Team, Present today,
Pending leave, Reviews due), leave breakdown, pending-leave decision list,
performance spotlight decision card.

**Add — move these graphs up from module pages, this hub currently has
zero real charts, just breakdown bars:**
- **Work Rhythm heatmap** — currently buried in `AttendanceDashboardPage`
  (`WorkRhythmHeatmap`). This is exactly the kind of "graph/diagram" that
  belongs on the hub per your direction — move it here so anyone opening
  People gets the weekly rhythm picture without drilling into Attendance.
- **Clock-in status donut** (`ClockInStatusDonut`) — same reasoning, move
  from the Attendance module page to the hub.
- **Team workload chart** (`TeamWorkloadChart`, currently only on the
  Manager dashboard) — belongs here, it's people-domain, not
  dashboard-domain.
- **Headcount trend** — small line/sparkline, "128 employees, +4 this
  month" — genuinely missing everywhere today.
- **Performance trend chart** (`PerformanceTrendChart`, compact “Company score
  trend”) — lives on the People hub only for admin/HR overview; `/performance`
  stays stats + action lists + employee table (no duplicate chart).

**Attendance module page (`/attendance`) after this move:** keeps its stat
cards (`AttendanceStatsRow`) + roster table + activities feed — drop
`WorkRhythmHeatmap` and `ClockInStatusDonut` since they now live on the hub.
This matches your rule exactly: stat cards + table on the module page,
charts on the hub.

---

## 5. Finance Hub (`/finance`) — add more charts/graphs (explicitly requested)

**Keep:** payroll snapshot stat cards, expense stat cards, expense status
breakdown, needs-approval / recently-approved decision lists,
`ExpenseSummaryChart` (this is its correct home now that it's removed from
Dashboard).

**Add:**
- **Payroll trend chart** — monthly payroll total over the last 6–12
  months (line/bar). Nothing shows payroll history anywhere today; this is
  a real gap for a Finance command-center.
- **Expense category breakdown chart** — you already have
  `ExpenseStats.byCategory` in the data model and it's rendered nowhere in
  the UI. Turn it into a donut/bar chart here — zero backend work, pure
  frontend win.
- **Salary distribution chart** — spend by department or by role band, if
  the payroll data supports grouping; gives Finance a "where is the money
  going" view instead of just totals.
- **`PayrollOverviewCard`** — move here fully from the HR dashboard (per
  §3), this is its natural home.

---

## 6. Work Hub (`/work`) — delivery command-center (projects + tasks + milestones + clients)

**Admin / HR / Manager (org view) shape:**
- Stat cards: **Total projects**, **Delayed projects**, **Overdue tasks**,
  **Milestones overdue** (company-scoped task + milestone APIs).
- Above fold: `ProjectStatusDonut` + Delayed projects decision list.
- Decisions: Overdue tasks + Milestones overdue; Task status donut.
- Insights: Contract value chart + Project timeline + company Task
  completion trend.
- No “Clients at risk” on the hub — delayed projects already cover that
  signal; clients stay available via `/clients` and the contract-value chart.

**Employee / personal fallback:** My tasks stats + personal task mix when
company scope is unavailable (`tasks/stats?scope=mine`).

**Backend support:**
- `GET /tasks/stats?scope=company` (+ progress) — org task totals + overdue
  sample list (admin/hr/manager; not employee).
- `GET /projects/milestones/stats` — pending/completed/overdue/dueSoon +
  overdue sample list.

---

## 7. Module pages — the standing rule

**Every module page keeps its own stat-card row and its table** — that part
of v1 was wrong to remove, correcting it now. What moves out is only the
**chart/graph component that's a duplicate of something the hub now
shows as a summary.**

| Page | Stat cards | Table | Chart — stays or moves? |
|---|---|---|---|
| `/projects` | Keep `ProjectStatsRow` | Keep | No chart currently here — fine as-is |
| `/expenses` | Keep `ExpenseStatsRow` | Keep | No chart currently here — fine as-is |
| `/salaries` | Keep `SalaryStatsRow` | Keep | No chart currently here — fine as-is |
| `/attendance` | Keep `AttendanceStatsRow` | Keep roster table + activities feed | **Move** `WorkRhythmHeatmap` + `ClockInStatusDonut` to People hub (§4) |
| `/performance` | Keep `PerformanceStatsRow` / `AdminCompanyHubStats` | Keep employee list (+ search/filter) | **Admin/HR:** no charts here — compact company score trend lives on People hub; page is stats + Top/At-risk lists + table. **Manager team view:** keep trend + department card. |
| `/team`, `/employees` | Add a one-line headcount trend stat (new, currently missing) | Keep directory | — |
| `/clients` | Add stat cards once `clientsApi.getStats()` exists (mirrors the new Work hub cards, at page scope) | Keep table | — |
| `/tasks` (My Tasks) | Keep (personal scope, distinct from Work hub's org view) | Keep board | Personal `TasksStatusDonut` can stay here too — it's genuinely personal-scope, different from the hub's org-wide version |
| `/reports` | — | — | Stays separate: period export tool, not a live snapshot page |

---

## 8. Performance module — final shape

- People hub → compact **Company score trend** chart + spotlight decision card
  (top performer / reviews due / at-risk), links to `/performance`.
- `/performance` (admin/hr view, `PerformanceDashboardPage`) → stat cards +
  Top performers / Needs attention decision lists + employee list
  (search/filter). Charts and deep analytics (KPI category health, value
  leaderboard, department bars) stay off this page so it stays an action +
  list workspace.
- `/performance` (employee/manager view, `MyPerformancePage`) → unchanged,
  personal scope. Manager team view keeps trend + department card + table.
- `/performance/analytics` → redirect, route removed.
- `/performance/list` → removed (§2).
- `/performance/team`, `/cycles`, `/goals`, `/calibration`,
  `/kpi-templates` → distinct workflows, not dashboards, unchanged.

---

## 9. Implementation order

1. Sidebar label fix (`work` → "Work"); redirect `/performance/analytics`;
   remove `/performance/list` and fold its filtering into
   `PerformanceDashboardPage`. Zero risk, do first.
2. Remove the literal duplicate chart components from all 5 role Dashboards
   (`ExpenseSummaryChart`, `ProjectOverviewChart`/`ProjectStatusDonut`,
   `PerformanceOverview`/`TopPerformersCard`, `PayrollOverviewCard`) —
   replace with stat cards only, keep the merged action feed + activity log.
3. Move `WorkRhythmHeatmap`, `ClockInStatusDonut`, `TeamWorkloadChart` from
   their current module/dashboard homes to the People hub.
4. Move `WorkProgressChart` / `TasksStatusDonut` (org-wide version) and
   `PayrollOverviewCard` to the Work and Finance hubs respectively.
5. Build `clientsApi.getStats()` + Work hub client stat cards + at-risk
   clients decision card — the one genuinely new backend piece.
6. Add the new chart content explicitly requested for Finance (payroll
   trend, expense-by-category using the already-existing `byCategory`
   field, salary distribution) and Work (task completion trend, contract
   value by client, project timeline view).
7. Consolidate the stat-card/donut/decision-list components into the single
   Hub-kit versions from §1 and reuse them at dashboard, hub, and module
   scope so the whole app shares one visual language.

Steps 1–2 are cleanup with no new work. Steps 3–4 relocate charts to where
they belong under the new rule. Step 5 is the one real backend addition.
Step 6 is the "more charts in Finance/Work" you asked for. Step 7 is the
long-term consistency payoff.
