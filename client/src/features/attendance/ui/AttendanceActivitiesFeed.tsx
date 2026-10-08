import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import {
  formatTimeLabel,
  punchActionLabel,
  relativeTime,
} from '@/features/attendance/lib/attendance-utils'
import {
  locationDisplayLabel,
  mapsLink,
} from '@/features/attendance/lib/punch-location'
import type { AttendanceDashboard } from '@/features/attendance/model/types'
import { AttendancePagination } from '@/features/attendance/ui/AttendancePagination'
import { LocationStatusBadge } from '@/features/attendance/ui/LocationStatusBadge'
import { useEffect, useMemo, useState } from 'react'

const PAGE_SIZE = 5

export function AttendanceActivitiesFeed({
  activities,
  timeZone,
}: {
  activities: AttendanceDashboard['activities']
  timeZone?: string
}) {
  const [page, setPage] = useState(1)
  const total = activities.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1)
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [activities])

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return activities.slice(start, start + PAGE_SIZE)
  }, [activities, safePage])

  return (
    <div className="flex min-h-[300px] flex-col rounded-xl border border-border-card bg-surface p-4 sm:p-5">
      <h3 className="text-base font-semibold text-heading">Attendance Activities</h3>
      {total === 0 ? (
        <ComingSoonState
          className="mt-4 flex-1"
          title="No activities yet"
          description="Attendance activity will show up here as the team clocks in and out."
          minHeight="min-h-0"
        />
      ) : (
        <>
          <ul className="mt-4 space-y-3">
            {pageItems.map((item) => {
              const color =
                item.type === 'clock_in'
                  ? 'bg-[#00B67A]'
                  : item.type === 'clock_out'
                    ? 'bg-[#EF4444]'
                    : 'bg-[#F59E0B]'
              const loc = item.location
              const mapHref = mapsLink(loc?.lat, loc?.lng)
              return (
                <li key={item.id} className="flex items-start gap-3">
                  <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-heading">
                      <span className="font-semibold">{item.employeeName}</span>{' '}
                      {punchActionLabel(item.type)} at {formatTimeLabel(item.at, timeZone)}
                    </p>
                    <p className="text-xs text-text-muted">{relativeTime(item.at)}</p>
                    {loc ? (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <LocationStatusBadge status={loc.status} />
                        {mapHref ? (
                          <a
                            href={mapHref}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#136DEC] hover:underline"
                          >
                            {locationDisplayLabel(loc)}
                          </a>
                        ) : (
                          <span className="text-xs text-text-muted">
                            {locationDisplayLabel(loc)}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
          <AttendancePagination
            pagination={{
              page: safePage,
              limit: PAGE_SIZE,
              total,
              totalPages,
            }}
            onPageChange={setPage}
            className="mt-4 border-t-0 px-0 pb-0"
          />
        </>
      )}
    </div>
  )
}
