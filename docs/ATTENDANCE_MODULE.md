# Attendance Module

BizFlow attendance tracks daily clock-in / break / clock-out punches, builds per-day summaries, and exposes team/company dashboards plus self-service history.

## Roles and permissions

| Permission | Roles | Access |
|------------|-------|--------|
| `attendance:self` | employee, manager, admin, hr | Punch + My Attendance |
| `attendance:team` | manager | Team dashboard / direct reports only |
| `attendance:manage` | admin, hr | Company dashboard, corrections |
| `attendance:settings` | admin | Shift / timezone / office sites |

Managers see **direct reports** only (`User.managerId`), same pattern as leave/team. Activity feeds that require `attendance:team` are also visible to users with `attendance:manage`.

## Routes (client)

| Path | Who |
|------|-----|
| `/attendance` | admin, hr, manager |
| `/attendance/settings` | admin |
| `/attendance/:employeeId` | manage / team / self (scoped) |
| `/my-attendance` | employee, manager, admin, hr |

Dashboards show the **ClockActionsWidget** for anyone with `attendance:self`.

## API (`/api/v1/attendance`)

- `POST /punch` `{ type: clock_in|break_start|break_end|clock_out, location?: { lat, lng, accuracyMeters?, label? } }`
  - Server attaches `ip` + `user-agent`, computes `location.status` (`on_site` | `remote` | `unknown`), and stores the full context on the punch.
  - Soft-warn only: remote / missing GPS punches are **never rejected**.
- `GET /me/today`, `GET /me`
- `GET /dashboard?scope=team|company&date=` — roster includes `clockInLocation`; activities include punch `location`
- `GET /employees/:employeeId`
- `PATCH /days/:id` (HR/admin manual correction)
- `GET|PUT /settings` — includes optional `officeSites[]` (`name`, `lat`, `lng`, `radiusMeters`)
- `GET /export?from&to&employeeId=`

List endpoints materialize missing days in the requested range and return `summary.statusCounts` + `summary.chartDays` for range-accurate charts (not the paginated page).

## Punch location (soft-warn)

1. Client requests browser geolocation (≈8s timeout) and may attach an approximate place `label` (reverse geocode).
2. Server stores GPS (if any) + IP + user-agent on every punch.
3. If company `officeSites` are configured and GPS is present:
   - Within any site radius → `on_site`
   - Outside all sites → `remote` (still allowed; employee sees a soft toast)
4. If GPS is denied/unavailable or no office sites are configured → `unknown` (still allowed).
5. Day summaries denormalize `clockInLocation` from the day’s first `clock_in` for roster/history.

**Not supported on web:** WiFi SSID / BSSID (browsers cannot expose network name).

## Day status rules (company timezone)

1. Non-workday → `weekend`
2. Approved leave overlapping the date → `on_leave` (not absent)
3. Punch before `shift.start + grace` → `present`
4. Punch after grace → `late`
5. Short worked day after clock-out → `half_day` when under half-day hours
6. Past workday, no punch → `absent`
7. Today, no punch → `not_arrived` (live dashboard)

One open session per calendar day; after clock-out, further clock-ins that day are rejected. Concurrent punches are serialized with a short-lived day lock.

### Open sessions and overnight

- Open work/break intervals are capped at **company-TZ end of day** when recomputing past dates (forgotten clock-out does not grow forever).
- Non-`clock_in` punches attach to yesterday’s date when yesterday still has an open session (overnight shift close).

### Manual corrections

- `PATCH /days/:id` sets `source: 'manual'` and recomputes late fields from edited clock-in.
- A later punch on that day recomputes with `preserveManual: false` and overwrites the manual row.

## Settings defaults

- Timezone: `Asia/Karachi`
- Work days: Mon–Fri
- Shift: 09:00–18:00, 60m break, 15m grace
- Half day: 4h / Full day: 8h
- Office sites: none (capture-only until admin adds sites)

## Integrations

- **Leave:** approve/reject recomputes attendance for each date in the leave span; approved leave overlays as `on_leave`
- **Performance / team:** monthly attendance % materializes elapsed workdays first; empty month with no elapsed workdays → 100%, otherwise real percent (absences count). Month keys use company timezone.
- **Team list:** monthly % returned as `attendanceById` and shown on team cards
- **Activities:** `attendance.clocked_in` / `attendance.clocked_out` domain events

## Deferred

- Hard geofence reject (block punches outside office radius)
- Multi-shift / per-employee schedules
- Payroll LOP from unpaid absences
- Holidays calendar
- Overtime
- WiFi SSID via native/desktop app
