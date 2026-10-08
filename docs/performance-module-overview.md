# BizFlow Performance Module — Current System Overview

> **Purpose of this doc:** Share with an AI/product partner for ideation. Describes how the Performance module works *today* — screens, data, flows, scoring, roles, and gaps.

---

## 1. What it is (one paragraph)

BizFlow Performance is a **monthly manager/admin review system**. For each calendar month, a reviewer (manager or admin) gives an employee or manager a **1–5 star rating** plus written feedback. The system also **auto-computes operational metrics** (tasks, attendance, projects, efficiency) from Tasks, Leave, and Projects. There are **no separate Goals, OKRs, KPIs, appraisal cycles, self-reviews, peer reviews, or salary linkage**.

**Core idea:** one `PerformanceReview` document per person per month + live metrics + role-scoped UIs.

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  /performance (role-aware home)                                  │
│  /performance/team | list | analytics | :id | reviews/new|edit   │
│  Embedded: dashboards, employee/team profile tabs, reports       │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST /api/performance/*
┌────────────────────────────▼────────────────────────────────────┐
│                         BACKEND                                  │
│  performance.service + performance-metrics                       │
│  Reads: Users, Tasks, LeaveRequests, Projects, Milestones        │
│  Writes: PerformanceReview (+ notifications)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│  MongoDB: PerformanceReview (unique per company+employee+month)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Data model

### Entity: `PerformanceReview`

| Field | Type | Meaning |
|--------|------|---------|
| `companyId` | ObjectId | Tenant |
| `employeeId` | ObjectId → User | Person being reviewed |
| `reviewerId` | ObjectId → User | Who wrote the review |
| `periodStart` | Date | First day of month |
| `periodEnd` | Date | Last day of month |
| `periodLabel` | String | e.g. `"Aug 2026"` |
| `rating` | Number 1–5 | Manual star rating |
| `feedback` | String | Written review |
| `status` | `draft` \| `submitted` | Default `draft`; UI always submits as `submitted` |
| `metricsSnapshot` | Object | Frozen metrics at submit time |
| `createdAt` / `updatedAt` | Date | Timestamps |

**`metricsSnapshot`:**
- `tasksCompleted`, `tasksPending` (counts)
- `deadlinesMet`, `attendance`, `efficiency` (0–100 percentages)

**Constraint:** Unique `{ companyId, employeeId, periodStart }` → **one review per person per month**.

### Who can be reviewed?

Only users with roles **`employee`** or **`manager`**. Admin, HR, and superadmin are never review subjects.

### What is *not* stored as entities

- No Goal / OKR / KPI collection  
- No Review Cycle collection (period = calendar month only)  
- No competency framework, self-assessment, or peer feedback entities  

### Derived (computed, not stored)

| Concept | How |
|---------|-----|
| Performance status | From rating: excellent / good / average / critical |
| Live efficiency & breakdown | From tasks / leave / projects |
| Rating trend | % change vs previous month’s submitted rating |
| Chart “goal” line | Hardcoded `4.0` on detail trend |

---

## 4. Permissions & who sees what

### Permission keys

- `performance:read` — view lists, stats, analytics, personal performance  
- `performance:write` — create/update reviews  

### Default role matrix

| Role | Read | Write | Scope |
|------|------|-------|--------|
| **Admin** | Yes | Yes | Whole company; can review employees **and** managers (not self) |
| **HR** | Yes | **No** | Whole company, view-only |
| **Manager** | Yes | Yes | Own performance + direct-report **employees** only; can only *write* reviews for direct reports |
| **Employee** | Yes | No | Own performance only |
| **Superadmin** | — | — | No company performance home |

Custom roles can grant read/write via Settings.

### Visibility rules (important)

- Employees only see **submitted** reviews about themselves.  
- Drafts are visible to the reviewer and admins (API supports drafts; UI does not save drafts today).  
- Managers cannot review other managers, non-reports, or themselves.  
- Admins rate managers; those show as “Admin Rating” on detail.

---

## 5. Frontend routes & what each screen shows

| Route | Guard | Screen | Audience |
|-------|-------|--------|----------|
| `/performance` | read | Role-aware home | Employee/Manager → My Performance; Admin/HR → Org hub |
| `/performance/team` | read | Team hub | Managers |
| `/performance/list` | read | Full list + filters | Manager / Admin / HR |
| `/performance/analytics` | read | Analytics | Primarily Admin/HR hub link |
| `/performance/:id` | read | Subject detail | Manager / Admin / HR |
| `/performance/:id/reviews/new` | write | Create review | Admin / Manager with `canReview` |
| `/performance/:id/reviews/:reviewId/edit` | write | Edit review | Same |

Nav label: employees see **“My Performance”**; others see **Performance**.

---

### 5.1 My Performance (`MyPerformancePage`)

**Who:** Employee (always), Manager (as their home).

**Shows:**
- Period picker (last ~12 months) + **Export Report** (CSV)
- Stats row: avg rating, tasks/projects done, current month rating, efficiency
- 6-month rating trend chart
- Breakdown cards (role-specific metrics)
- Recent reviews table
- Managers also get link: **View team performance →**

**Does not:** create reviews, open org list/detail.

---

### 5.2 Org / Team Hub (`PerformanceDashboardPage`)

**Who:** Admin/HR at `/performance`; Managers at `/performance/team` (team-scoped).

**Shows:**
- Stats: avg rating (+ change), top performer, reviews due, low performance count
- Monthly rating trend
- Department performance bars
- Top 5 performers table
- Links to full list (+ analytics for admin/HR)

---

### 5.3 List (`PerformanceListPage`)

**Shows:**
- Filters: search, rating band (`4+` / `3-4` / `below3`), status (excellent/good/average/critical), period
- Table of people: rating, live metrics, status badge, trend
- Click through to detail

Employees are redirected away from list.

---

### 5.4 Detail (`PerformanceDetailPage`)

**Shows for one subject:**
- Profile overview (avatar, dept, tasks/projects, attendance, efficiency)
- Breakdown card (employee vs manager metric set)
- Quick stats + rating trend vs goal line (4.0)
- Manager/Admin rating card + recent reviews
- Actions when allowed: **Add Review** (no review for month) or **Update Rating**

---

### 5.5 Create / Edit Review (`ReviewForm`)

**Shows:**
- Subject profile header
- Period select (locked on edit)
- Interactive half-star rating (1–5)
- **Live read-only auto metrics** (informational; do not auto-set stars)
- Feedback textarea (required on submit)
- Previous feedback sidebar + tips

**Submit behavior:** Always posts `status: 'submitted'`. Draft UI is unused even though the API supports `draft`.

---

### 5.6 Analytics (`PerformanceAnalyticsPage`)

**Shows:**
- Overall efficiency, review completion %, avg rating, top department
- Filters: department, manager, rating range, period
- Charts: efficiency trend, dept ratings, rating distribution, productivity weeks, top departments

---

### 5.7 Embedded elsewhere (not dedicated routes)

| Location | What appears |
|----------|----------------|
| Admin dashboard | Performance overview — top performers + reviews completed |
| Employee dashboard | Card: efficiency %, rating, tasks, status |
| Manager dashboard | “Team Performance” stat + top list |
| Employee detail tab | Performance summary tab |
| Team member detail tab | Same performance tab |
| Reports module | Report type `performance` from submitted reviews |
| Notification settings | Toggle for performance review notifications |

---

## 6. User flows (step by step)

### Employee flow

1. Opens **My Performance** from nav.  
2. Picks a month → sees live metrics + any **submitted** review for that month.  
3. Can export CSV of their report.  
4. Cannot rate anyone.  
5. Gets a notification when a review is created/updated about them.

### Manager flow

1. Home = **own** My Performance (manager-style metrics: projects, milestones, team tasks).  
2. Clicks **View team performance** → team hub for direct reports.  
3. Opens list/detail for a report.  
4. If no review for the month → **Add Review**; else **Update Rating**.  
5. Form shows auto metrics; manager sets stars + feedback → Submit.  
6. Cannot review managers, non-reports, or self.

### Admin flow

1. Home = **org hub** (no personal `/me` ratings).  
2. Sees all active employees and managers.  
3. Can create/update reviews for employees **and** managers.  
4. Uses list + analytics for org-wide insight.

### HR flow

1. Same org read views as admin.  
2. **Cannot** create or edit reviews (no `performance:write` by default).

---

## 7. End-to-end review lifecycle

```
No review for month
        │
        ▼
  Manager/Admin opens Create Review
        │
        ▼
  Selects period (calendar month)
  Sees live metrics (auto)
  Sets rating 1–5 + feedback
        │
        ▼
  Submit (status = submitted)
        │
        ├─ Metrics snapshot frozen on document
        ├─ Unique constraint: one per person/month
        ├─ Notify: reviewed employee + their manager
        └─ Visible on My Performance / detail / list / analytics / reports

Later:
  Same reviewer (or admin) can Edit → update rating/feedback
  (document stays submitted; no approve/reject/ack states)
```

### Status transitions

| Review document | Meaning |
|-----------------|---------|
| (none) | No review for that month |
| `draft` | API-supported; UI does not use it |
| `submitted` | Published for the subject to see |

There is **no** HR approval, employee acknowledgment, or calibration lock.

### Display status from rating

| Rating | Status label |
|--------|----------------|
| ≥ 4.5 | excellent |
| ≥ 4.0 | good |
| ≥ 3.5 | average |
| < 3.5 | critical |

On My Performance, if there is no rating yet, status falls back to **efficiency bands**: ≥85 excellent, ≥70 good, ≥55 average, else critical.

---

## 8. Auto metrics & scoring formulas

Period is always a **calendar month**. Metrics are computed live; a snapshot is frozen when a review is submitted.

### Employee metrics

| Metric | Source / formula |
|--------|------------------|
| Tasks completed | Tasks with `status=done`, assignee=user, `updatedAt` in period |
| Tasks pending | Status in `todo` / `in_progress` / `hold`, created ≤ period end |
| Deadlines met % | Of completed tasks with due dates, finished on/before due |
| Attendance % | Mon–Fri working days minus overlapping **approved** leave days |
| Task completion rate | completed / (completed + pending) |
| Project contribution | Done project tasks / all project tasks |
| Team collaboration | Proxy: share of completed tasks with `projectId` × 50 + 0.5 × deadlinesMet |
| **Efficiency** | `0.35 × taskCompletion + 0.35 × deadlinesMet + 0.3 × attendance` |

**Breakdown UI labels:** Task Completion, Attendance, Project Contribution, Team Collaboration.

### Manager metrics

| Metric | Source / formula |
|--------|------------------|
| Projects | Projects where `managerId` = this manager |
| Project completion % | completed projects / total |
| Avg project progress | Mean of project `progress` |
| Milestone completion | Completed milestones across managed projects |
| Team tasks | Aggregated from direct-report employees’ tasks |
| Attendance | Manager’s own leave-based attendance |
| **Efficiency** | `0.35 × avgProgress + 0.35 × projectCompletion + 0.3 × milestoneCompletion` |

**Breakdown UI labels:** Project Completion, Avg Progress, Milestone Completion, Team Task Completion.

### Manual rating vs metrics

- Reviewer chooses **1–5** (UI supports half stars).  
- Metrics **inform** the reviewer; they **do not** auto-set the star rating.  
- Aggregations (avg rating, reviews due, low performers, department scores, distribution) use submitted ratings + live efficiency as appropriate.

### Aggregations used in hub / analytics

- Avg rating across rated people in scope  
- Reviews due = people with **no** submitted rating for the period  
- Low performance = status average or critical  
- Department score mixes normalized rating and efficiency  
- Rating distribution buckets (e.g. ≥4.5 / 4–4.5 / <4)  
- Trend = `((current − previous) / previous) × 100`

---

## 9. Backend API surface

Base path: **`/api/performance`** (all require auth + active account).

| Method | Path | Permission | Purpose |
|--------|------|------------|---------|
| GET | `/` | read | Paginated performance records (scoped + live metrics + rating) |
| GET | `/stats` | read | Hub stats (avg, top, due, low, trend, depts) |
| GET | `/analytics` | read | Org analytics bundle |
| GET | `/options` | read | Departments, managers, last 12 month periods |
| GET | `/me` | read | Personal performance (employee/manager) |
| GET | `/employees/:employeeId` | read | Full detail for one subject |
| GET | `/employees/:employeeId/metrics` | read | Live metrics for period |
| GET | `/employees/:employeeId/reviews` | read | Review history |
| GET | `/employees/:employeeId/summary` | read | Compact summary (profiles/dashboards) |
| GET | `/reviews/:reviewId` | read | Single review |
| POST | `/employees/:employeeId/reviews` | write | Create review |
| PATCH | `/reviews/:reviewId` | write | Update rating/feedback/status |

**Create rules:** period required; rating + non-empty feedback required when `submitted`; duplicate period → conflict.

---

## 10. Connections to other modules

| Module | How it connects |
|--------|-----------------|
| **Tasks** | Completion, pending, deadlines, collaboration proxies |
| **Leave** | Attendance from approved leave overlap with working days |
| **Projects / Milestones** | Manager efficiency; employee project contribution |
| **Users / Employees** | Subjects, manager hierarchy, departments |
| **Team** | Manager’s team member Performance tab |
| **Notifications** | `performance.review_created` / `review_updated` → subject + their manager |
| **Reports** | `reportType: 'performance'` from submitted reviews |
| **Dashboards** | Widgets for admin / employee / manager |
| **Settings** | Notification prefs; custom role permissions |
| **Salaries** | **No linkage today** |

---

## 11. Product gaps (useful for ideation)

What typical performance products have that BizFlow does **not** yet:

1. Goals / OKRs / KPIs with targets, weights, and progress  
2. Named review cycles (quarterly / annual) with open/close windows  
3. Self-assessment and peer / 360 feedback  
4. Multi-step workflow (draft → manager → HR → employee acknowledgment)  
5. Calibration / forced distribution tooling beyond analytics charts  
6. Compensation / promotion / salary hooks  
7. Competency or skill frameworks  
8. Draft save in UI (schema supports `draft`; UI always submits)  
9. HR write access for reviews by default  
10. Continuous check-ins separate from monthly reviews  

**Current foundation in one line:**  
monthly period + one review document + live ops metrics + star rating + role-scoped visibility.

---

## 12. Key source files (for engineers)

### Backend
- `server/src/features/performance/performance-review.model.ts`
- `server/src/features/performance/performance.routes.ts`
- `server/src/features/performance/performance.controller.ts`
- `server/src/features/performance/performance.service.ts`
- `server/src/features/performance/performance-metrics.ts`
- `server/src/features/performance/performance.types.ts`
- `server/src/features/performance/performance.validation.ts`

### Frontend
- `client/src/features/performance/pages/` (Home, My, Team, Dashboard, List, Detail, Create, Edit, Analytics)
- `client/src/features/performance/api/performanceApi.ts`
- `client/src/features/performance/ui/ReviewForm.tsx`
- `client/src/features/performance/lib/performance-utils.ts`
- `client/src/app/router.tsx` (routes under `/performance`)

---

## 13. Suggested prompt when sharing this with Claude

You can paste this file and ask something like:

> “Here is how BizFlow’s Performance module works today. Propose product improvements and UX ideas that build on this foundation — prioritize high-impact, implementable features for an SMB ops SaaS. Call out what we should keep vs redesign. Suggest 2–3 roadmap phases.”

---

*Generated from the BizFlow codebase as of the current Performance feature set.*
