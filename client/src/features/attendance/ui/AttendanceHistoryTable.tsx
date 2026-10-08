import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { formatDateLabel, formatTimeLabel } from '@/features/attendance/lib/attendance-utils'
import {
  locationDisplayLabel,
  mapsLink,
} from '@/features/attendance/lib/punch-location'
import type { AttendanceDay, AttendanceDayStatus, PunchLocationSummary } from '@/features/attendance/model/types'
import {
  AttendancePagination,
  type AttendancePaginationState,
} from '@/features/attendance/ui/AttendancePagination'
import { AttendanceStatusBadge } from '@/features/attendance/ui/AttendanceStatusBadge'
import { LocationStatusBadge } from '@/features/attendance/ui/LocationStatusBadge'
import { SelectField } from '@/shared/ui/SelectField'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ClockInLocationCell({ loc }: { loc?: PunchLocationSummary | null }) {
  if (!loc) return null
  const href = mapsLink(loc.lat, loc.lng)
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <LocationStatusBadge status={loc.status} />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-[#136DEC] hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {locationDisplayLabel(loc)}
        </a>
      ) : (
        <span className="text-xs text-text-muted">{locationDisplayLabel(loc)}</span>
      )}
    </div>
  )
}

function EmployeeCell({ row }: { row: AttendanceDay }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] text-xs font-semibold text-heading">
        {row.avatar ? (
          <img src={row.avatar} alt="" className="size-full object-cover" />
        ) : (
          (row.employeeName ?? '?').slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-heading">{row.employeeName ?? '—'}</p>
        <p className="truncate text-xs text-text-muted">{row.jobTitle ?? row.department}</p>
      </div>
    </div>
  )
}

export function AttendanceRosterTable({
  rows,
  timeZone,
  status,
  onStatusChange,
  pagination,
  onPageChange,
}: {
  rows: AttendanceDay[]
  timeZone?: string
  status?: AttendanceDayStatus | ''
  onStatusChange?: (status: AttendanceDayStatus | '') => void
  pagination?: AttendancePaginationState
  onPageChange?: (page: number) => void
}) {
  const hasData = rows.length > 0
  const isFiltered = Boolean(status)

  return (
    <div className="overflow-hidden rounded-xl border border-border-card bg-surface">
      <div className="flex flex-col gap-3 border-b border-border-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-base font-semibold text-heading">Team roster</h3>
          <p className="text-xs text-text-muted">Attendance for the selected day</p>
        </div>
        {onStatusChange && (hasData || isFiltered) ? (
          <label className="flex w-full items-center gap-2 text-sm sm:w-auto">
            <span className="text-text-muted">Status</span>
            <SelectField
              value={status ?? ''}
              onChange={(e) => onStatusChange(e.target.value as AttendanceDayStatus | '')}
              className="!h-10 w-full rounded-lg text-sm sm:w-[160px]"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On Leave</option>
              <option value="half_day">Half Day</option>
              <option value="not_arrived">Not Arrived</option>
            </SelectField>
          </label>
        ) : null}
      </div>

      {!hasData ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No attendance found' : 'No attendance yet'}
            description={
              isFiltered
                ? 'Try adjusting the status filter.'
                : 'Team attendance for this day will show up here.'
            }
            minHeight="min-h-[220px]"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {rows.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <EmployeeCell row={row} />
                  <AttendanceStatusBadge status={row.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Clock In</dt>
                    <dd className="text-right text-heading">
                      <div>{formatTimeLabel(row.clockInAt, timeZone)}</div>
                      <div className="text-xs text-text-muted">{formatDateLabel(row.date)}</div>
                      <ClockInLocationCell loc={row.clockInLocation} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Clock Out</dt>
                    <dd className="text-right text-heading">
                      <div>{formatTimeLabel(row.clockOutAt, timeZone)}</div>
                      <div className="text-xs text-text-muted">{formatDateLabel(row.date)}</div>
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex justify-end">
                  <Link
                    to={`/attendance/${row.employeeId}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg text-[#136DEC] hover:bg-[#EFF6FF]"
                    title="View details"
                  >
                    <EyeIcon />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-card bg-[#F8FAFC] text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold xl:px-6">Employee</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Clock In</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Clock Out</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Status</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-border-card last:border-0">
                    <td className="px-4 py-3 xl:px-6">
                      <EmployeeCell row={row} />
                    </td>
                    <td className="px-4 py-3 text-text-muted xl:px-6">
                      <div>{formatTimeLabel(row.clockInAt, timeZone)}</div>
                      <div className="text-xs">{formatDateLabel(row.date)}</div>
                      <ClockInLocationCell loc={row.clockInLocation} />
                    </td>
                    <td className="px-4 py-3 text-text-muted xl:px-6">
                      <div>{formatTimeLabel(row.clockOutAt, timeZone)}</div>
                      <div className="text-xs">{formatDateLabel(row.date)}</div>
                    </td>
                    <td className="px-4 py-3 xl:px-6">
                      <AttendanceStatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 xl:px-6">
                      <Link
                        to={`/attendance/${row.employeeId}`}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-[#136DEC] hover:bg-[#EFF6FF]"
                        title="View details"
                      >
                        <EyeIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {hasData && pagination && onPageChange && (
        <AttendancePagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  )
}
