import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { formatDateLabel, formatTimeLabel } from '@/features/attendance/lib/attendance-utils'
import {
  locationDisplayLabel,
  mapsLink,
} from '@/features/attendance/lib/punch-location'
import type { AttendanceDay, PunchLocationSummary } from '@/features/attendance/model/types'
import {
  AttendancePagination,
  type AttendancePaginationState,
} from '@/features/attendance/ui/AttendancePagination'
import { AttendanceStatusBadge } from '@/features/attendance/ui/AttendanceStatusBadge'
import { LocationStatusBadge } from '@/features/attendance/ui/LocationStatusBadge'

type AttendanceDetailHistoryTableProps = {
  days: AttendanceDay[]
  pagination?: AttendancePaginationState
  onPageChange?: (page: number) => void
  timeZone?: string
  canCorrect?: boolean
  onCorrect?: (day: AttendanceDay) => void
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
        >
          {locationDisplayLabel(loc)}
        </a>
      ) : (
        <span className="text-xs text-text-muted">{locationDisplayLabel(loc)}</span>
      )}
    </div>
  )
}

export function AttendanceDetailHistoryTable({
  days,
  pagination,
  onPageChange,
  timeZone,
  canCorrect,
  onCorrect,
}: AttendanceDetailHistoryTableProps) {
  const hasData = days.length > 0
  const showPagination = Boolean(pagination && onPageChange && pagination.total > 0)

  return (
    <div className="overflow-hidden rounded-xl border border-border-card bg-surface">
      {!hasData ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title="No attendance yet"
            description="Attendance history for this range will show up here."
            minHeight="min-h-[220px]"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {days.map((day) => (
              <div
                key={day.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-heading">{formatDateLabel(day.date)}</p>
                  <AttendanceStatusBadge status={day.status} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Check In</dt>
                    <dd className="text-right text-heading">
                      <div>{formatTimeLabel(day.clockInAt, timeZone)}</div>
                      <ClockInLocationCell loc={day.clockInLocation} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Check Out</dt>
                    <dd className="text-heading">{formatTimeLabel(day.clockOutAt, timeZone)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Working Hours</dt>
                    <dd className="text-heading">{day.workHoursLabel}</dd>
                  </div>
                </dl>
                {canCorrect ? (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onCorrect?.(day)}
                      className="text-sm font-semibold text-[#136DEC] hover:underline"
                    >
                      Correct
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border-card bg-[#F8FAFC] text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold xl:px-6">Dates</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Check In</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Check Out</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Working Hours</th>
                  <th className="px-4 py-3 font-semibold xl:px-6">Status</th>
                  {canCorrect && (
                    <th className="px-4 py-3 font-semibold xl:px-6">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day.id} className="border-b border-border-card last:border-0">
                    <td className="px-4 py-3 font-medium text-heading xl:px-6">
                      {formatDateLabel(day.date)}
                    </td>
                    <td className="px-4 py-3 text-text-muted xl:px-6">
                      <div>{formatTimeLabel(day.clockInAt, timeZone)}</div>
                      <ClockInLocationCell loc={day.clockInLocation} />
                    </td>
                    <td className="px-4 py-3 text-text-muted xl:px-6">
                      {formatTimeLabel(day.clockOutAt, timeZone)}
                    </td>
                    <td className="px-4 py-3 text-text-muted xl:px-6">{day.workHoursLabel}</td>
                    <td className="px-4 py-3 xl:px-6">
                      <AttendanceStatusBadge status={day.status} />
                    </td>
                    {canCorrect && (
                      <td className="px-4 py-3 xl:px-6">
                        <button
                          type="button"
                          onClick={() => onCorrect?.(day)}
                          className="text-sm font-semibold text-[#136DEC] hover:underline"
                        >
                          Correct
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showPagination && pagination && onPageChange ? (
        <AttendancePagination pagination={pagination} onPageChange={onPageChange} />
      ) : null}
    </div>
  )
}
