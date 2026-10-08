# Salaries & Leaves Company-Flexible Upgrade

> Stakeholder overview of the upgrade delivered in product. See implementation in `server/src/features/salaries` and `server/src/features/leave`.

## Goals

1. **Flexible allowances** — each company configures its own earning/deduction catalog.
2. **Provident fund** — employee % + employer match % on basic or gross; posted to a per-employee PF ledger when salary is marked paid.
3. **Monthly payroll** — month/year filters, generate for the selected period, period-scoped stats.
4. **Leave excess** — company policy: reject, auto salary-deduct, or admin waive/deduct on approve.
5. **Leave ↔ salary** — unpaid/excess days auto-fill leave deduction on generate; optional year-end encashment of unused paid leave (non-carry-forward).

## Key surfaces

| Area | Path / API |
|------|------------|
| Payroll settings UI | `/salaries/settings` |
| Settings API | `GET/PUT /salaries/settings`, component CRUD under `/salaries/settings/components` |
| PF balance | `GET /salaries/pf/:employeeId` |
| Encashment | `POST /leaves/encashment` |

## Defaults (unchanged until configured)

- PF disabled (0%)
- Excess leave mode: `reject`
- Encashment disabled
- Catalog seeded from legacy columns (BASIC, HRA, UTILITY, …)

## Daily rate

`amount = days × (basic ÷ divisor)` with company-configurable divisor (default 30).
