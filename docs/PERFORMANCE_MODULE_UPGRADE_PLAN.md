# BizFlow Performance Module — Upgrade Plan (KPI + ROI)

> Working doc for the team. Describes the target state for merging the manual
> Excel KPI sheet into the digital Performance module, adding an ROI layer,
> and tightening role-based visibility. Pairs with the existing
> `performance-module-overview.md`.

---

## 1. Problem statement

Two disconnected systems exist today:

1. **Digital module** — 1–5 star rating + auto-computed operational metrics
   (tasks, attendance, efficiency). No weights, no targets, no ROI.
2. **Excel KPI sheet** — weighted scorecard (6 categories, 15 sub-KPIs,
   subtotals, bonus/penalty, 0–100 final score, performance bands) filled
   manually per employee, outside the app.

**Goal:** absorb the Excel scoring logic into the app as a configurable KPI
framework, unify scoring on one scale, and layer an ROI/value metric on top —
without inventing numbers we don't have data for.

---

## 2. Data model changes

### New: `KPITemplate`

Configurable per company/role — replaces the hardcoded Excel tabs.

```ts
KPITemplate {
  companyId: ObjectId
  role: 'employee' | 'manager'
  name: string
  isActive: boolean
  categories: [
    {
      name: string
      weightPct: number
      maxMarks: number
      subKpis: [
        { id: string, label: string, maxMarks: number }
      ]
    }
  ]
}
```

### Extend: `PerformanceReview`

```ts
PerformanceReview {
  // existing fields unchanged: companyId, employeeId, reviewerId,
  // periodStart, periodEnd, periodLabel, rating, feedback, status,
  // metricsSnapshot, createdAt, updatedAt

  kpiTemplateId: ObjectId          // which template was used
  kpiScores: [
    { subKpiId: string, marksObtained: number, remarks: string }
  ]
  categoryScores: [                // computed, frozen at submit
    { name: string, maxMarks: number, obtained: number }
  ]
  totalScore: number               // sum of category obtained
  bonus: number
  penalty: number
  bonusPenaltyNote: string         // required if bonus or penalty != 0
  finalAdjustedScore: number       // totalScore + bonus - penalty
  performanceLevel: string         // derived, see §3

  roi: {
    outputValue: number            // Phase A — see §4
    effortInput: number
    roiIndex: number
    financialRoi: number | null    // Phase B — null until cost data exists
  }
}
```

### New permission: `performance:kpi-setup`

Controls who can create/edit `KPITemplate` records (weights, categories,
sub-KPIs). Separate from `performance:write` (scoring a review).

---

## 3. Unified scoring scale

Standardize on the Excel's 0–100 scale as the **primary quantitative score**.
Keep the 1–5 star as a secondary qualitative "gut check" the reviewer sets
alongside it — don't replace one with the other.

```
Category subtotal   = SUM(marksObtained for subKpis in category)
Total score          = SUM(category subtotals)
Final adjusted score = Total score + Bonus − Penalty
Performance level:
  >= 90  → Excellent
  >= 75  → Good
  >= 60  → Needs Improvement
  <  60  → Poor
```

This replaces the current inconsistency where the app derives status from
stars (≥4.5 excellent) while the sheet uses 0–100 (≥90 excellent).

---

## 4. ROI layer

No salary/cost linkage exists today — don't fabricate a financial ROI number
without real cost data. Two phases:

**Phase A — Output/Value Index (buildable now)**

```
ROI Index = (weighted KPI score × output volume) / effort input
```

- `output volume` = completed tasks/projects, weighted by priority or
  project value
- `effort input` = hours logged, or headcount time if not tracking hours
- Surface this as **"Value Delivered"**, not "ROI," until Phase B lands —
  avoids implying a financial figure that isn't there.

**Phase B — Financial ROI (requires Salary/Cost module link)**

```
ROI = (business value generated − fully-loaded cost) / cost
```

Blocked on linking employee cost (salary + overhead). Track as its own
roadmap item, not bundled into Phase 1/2 work below.

---

## 5. Role visibility & permissions

| Capability | Admin | HR | Manager | Employee |
|---|---|---|---|---|
| `performance:read` (own) | ✓ | ✓ | ✓ | ✓ |
| `performance:read:team` | ✓ | ✓ | ✓ | – |
| `performance:read:org` | ✓ | ✓ | – | – |
| `performance:write` (score reviews) | ✓ | – | ✓ (direct reports only) | – |
| `performance:kpi-setup` (templates/weights) | ✓ | optional | – | – |
| `performance:roi:view` | ✓ | ✓ | own team only | optional/off |

### Admin
- Org KPI hub: avg score, avg ROI index, reviews due, top/bottom performers
- Department-level KPI category breakdown
- Bonus/penalty audit log, org-wide
- Only role that edits `KPITemplate` (categories/weights/max marks)
- Can score reviews for employees and managers

### HR
- Same org KPI/ROI dashboards as Admin (read-only)
- Full review history + bonus/penalty log
- No scoring by default; consider granting `performance:kpi-setup` since
  template governance is arguably an HR responsibility, separate from
  authoring reviews

### Manager
- Own performance (manager-role metrics + KPI score + rating + own ROI index)
- Team hub: direct reports' KPI scores, trend, reviews due — team-scoped
- Fills in `marksObtained` per sub-KPI for direct reports; cannot edit
  weights/categories (template is published by Admin)
- Sets bonus/penalty with a required note (feeds the audit log)
- Cannot review other managers, non-reports, or self — unchanged

### Employee
- My Performance: own KPI Scorecard (category breakdown), final adjusted
  score + level, trend over months
- Auto metrics (tasks, attendance, efficiency) — unchanged
- Own bonus/penalty entries with the manager's note (transparency)
- ROI/Value index: **product decision** — recommend holding this from
  employee view initially; a low personal "value" figure can land badly
  without context. Expose KPI score/category breakdown first.
- Cannot rate anyone, see team/org data, or see the template — unchanged

---

## 6. UI changes

- **Review form**: tabs — *Auto Metrics* / *KPI Scorecard* (mirrors Excel
  rows) / *Rating & Feedback*. Keep the Excel's "Section Summary" side panel
  pattern, made live as marks are entered.
- **Detail page**: category breakdown chart (radar/bar) + ROI/Value card +
  bonus/penalty audit trail, replacing the single trend-vs-4.0-goal-line.
- **Analytics**: category-level benchmarks by department, ROI leaderboard,
  flag for reviews scored against an outdated/inactive template.
- **Reports**: exportable PDF mirroring the original Excel layout 1:1, plus
  a separate ROI/Value summary report.
- **New admin screen**: KPI Template Setup (categories, sub-KPIs, weights,
  max marks, active/inactive per role).

---

## 7. Roadmap

| Phase | Scope |
|---|---|
| **1** | Build `KPITemplate`, extend `PerformanceReview`, digitize the Excel scoring inside `ReviewForm`, unify on 0–100 scale, retire the manual Excel sheet |
| **2** | Add Output/Value ROI index (Phase A formula), category-level analytics, bonus/penalty audit trail, KPI Template Setup screen for Admin |
| **3** | Link Salary/Cost module → true financial ROI (Phase B), named review cycles (quarterly/annual), goals/OKRs, calibration tooling |

---

## 8. Open product decisions (flag before Phase 1 build)

- [ ] Does HR get `performance:kpi-setup`, or does template ownership stay
      with Admin only?
- [ ] Do employees see any ROI/Value figure, or is it manager/admin-only
      until Phase B (financial ROI) exists?
- [ ] Are KPI templates versioned (so historical reviews keep the template
      they were scored against even if weights change later)?
- [ ] Bonus/penalty: free-text note only, or a required reason category
      (for audit/compliance consistency)?

---

*Source: BizFlow Performance module overview + KPI_sheet_company.xlsx,
consolidated into this plan for implementation tracking.*
