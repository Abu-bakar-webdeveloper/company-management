import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAttendanceDashboard } from '@/features/attendance/hooks/useAttendance'
import { localDateString, mondayOfWeek } from '@/features/attendance/lib/attendance-utils'
import type { AttendanceDayStatus } from '@/features/attendance/model/types'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { AttendanceActivitiesFeed } from '@/features/attendance/ui/AttendanceActivitiesFeed'
import { AttendanceRosterTable } from '@/features/attendance/ui/AttendanceHistoryTable'
import { AttendanceStatsRow } from '@/features/attendance/ui/AttendanceStatsRow'

const ROSTER_PAGE_SIZE = 10

export function AttendanceDashboardPage() {
  const { user } = useAuth()
  const scope =
    user && userHasPermission(user, 'attendance:manage')
      ? 'company'
      : ('team' as const)
  const canSettings = !!user && userHasPermission(user, 'attendance:settings')
  const [date, setDate] = useState(() => localDateString())
  const [weekFrom, setWeekFrom] = useState(() => mondayOfWeek(localDateString()))
  const [rosterStatus, setRosterStatus] = useState<AttendanceDayStatus | ''>('')
  const [rosterPage, setRosterPage] = useState(1)

  const { data, isLoading, isError, isFetching } = useAttendanceDashboard({
    scope,
    date,
    weekFrom,
  })
  const timeZone = data?.settings.timezone

  const rosterView = useMemo(() => {
    const all = data?.roster ?? []
    const filtered = rosterStatus ? all.filter((row) => row.status === rosterStatus) : all
    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / ROSTER_PAGE_SIZE) || 1)
    const page = Math.min(rosterPage, totalPages)
    const start = (page - 1) * ROSTER_PAGE_SIZE
    return {
      rows: filtered.slice(start, start + ROSTER_PAGE_SIZE),
      pagination: { page, limit: ROSTER_PAGE_SIZE, total, totalPages },
    }
  }, [data?.roster, rosterPage, rosterStatus])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-9 text-[#1E293B] sm:text-[30px]">
            Attendance
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#64748B] sm:text-base">
            Track team presence, punctuality, and working hours.
            {isFetching && data ? (
              <span className="ml-2 text-xs text-text-muted">Updating…</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <span className="font-medium text-heading">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const next = e.target.value
                setDate(next)
                setWeekFrom(mondayOfWeek(next))
                setRosterPage(1)
              }}
              className="rounded-lg border border-border-card px-3 py-2 text-heading"
            />
          </label>
          {canSettings && (
            <Link
              to="/attendance/settings"
              className="rounded-lg border border-border-card px-4 py-2 text-sm font-semibold text-heading hover:bg-[#F8FAFC]"
            >
              Settings
            </Link>
          )}
        </div>
      </header>

      {isLoading && !data && <p className="text-sm text-text-muted">Loading attendance…</p>}
      {isError && !data && (
        <p className="text-sm text-[#DC2626]">Unable to load attendance dashboard.</p>
      )}

      {data && (
        <>
          <AttendanceStatsRow
            totalEmployees={data.stats.totalEmployees}
            present={data.stats.present}
            absent={data.stats.absent}
            late={data.stats.late}
            onLeave={data.stats.onLeave}
            notArrived={data.stats.notArrived}
          />

          <p className="mb-6 text-sm text-text-muted">
            Team rhythm and clock-in mix live on the{' '}
            <Link to="/people" className="font-semibold text-primary hover:opacity-90">
              Workforce hub
            </Link>
            .
          </p>

          <section className="mb-6">
            <AttendanceActivitiesFeed activities={data.activities} timeZone={timeZone} />
          </section>

          <AttendanceRosterTable
            rows={rosterView.rows}
            timeZone={timeZone}
            status={rosterStatus}
            onStatusChange={(status) => {
              setRosterStatus(status)
              setRosterPage(1)
            }}
            pagination={rosterView.pagination}
            onPageChange={setRosterPage}
          />
        </>
      )}
    </div>
  )
}
