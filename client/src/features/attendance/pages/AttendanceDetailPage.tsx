import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { attendanceApi } from '@/features/attendance/api/attendanceApi'
import {
  useAttendanceSettings,
  useEmployeeAttendance,
  useMyAttendance,
} from '@/features/attendance/hooks/useAttendance'
import {
  addLocalDays,
  buildPersonalWorkingHoursRange,
  buildPersonalWorkingHoursWeek,
  formatMonthRangeLabel,
  formatWeekRangeLabel,
  localDateString,
  localMonthBounds,
  mondayOfWeek,
  monthBoundsFromYm,
  yearMonth,
} from '@/features/attendance/lib/attendance-utils'
import type { AttendanceDay, AttendanceDayStatus } from '@/features/attendance/model/types'
import { AttendanceDetailHistoryTable } from '@/features/attendance/ui/AttendanceDetailHistoryTable'
import { AttendanceDetailStats } from '@/features/attendance/ui/AttendanceDetailStats'
import { AttendanceHistoryToolbar } from '@/features/attendance/ui/AttendanceHistoryToolbar'
import { AttendanceProfileCard } from '@/features/attendance/ui/AttendanceProfileCard'
import { ClockInStatusDonut } from '@/features/attendance/ui/ClockInStatusDonut'
import { CorrectAttendanceDayModal } from '@/features/attendance/ui/CorrectAttendanceDayModal'
import { MonthActivityCalendar } from '@/features/attendance/ui/MonthActivityCalendar'
import { WorkingHoursChart } from '@/features/attendance/ui/WorkingHoursChart'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { getErrorMessage } from '@/shared/api/errors'

const periodControlClass =
  'rounded-md border border-border-card bg-white px-2 py-1.5 text-xs font-medium text-heading'

const TABLE_PAGE_SIZE = 10

function clockInCountsForRange(
  days: Array<{ date: string; status: AttendanceDayStatus }>,
  from: string,
  to: string,
) {
  let onTime = 0
  let late = 0
  let notArrived = 0
  for (const day of days) {
    if (day.date < from || day.date > to) continue
    if (day.status === 'present' || day.status === 'half_day') onTime += 1
    else if (day.status === 'late') late += 1
    else if (day.status === 'not_arrived' || day.status === 'absent') notArrived += 1
  }
  const total = onTime + late + notArrived
  return {
    onTime,
    late,
    notArrived,
    onTimePercent: total === 0 ? 0 : Math.round((onTime / total) * 100),
  }
}

function clampYm(ym: string, maxYm: string): string {
  return ym > maxYm ? maxYm : ym
}

type AttendanceDetailViewProps = {
  employeeId?: string
  self?: boolean
}

export function AttendanceDetailView({ employeeId, self }: AttendanceDetailViewProps) {
  const { user } = useAuth()
  const canManage = !!user && userHasPermission(user, 'attendance:manage')
  const bounds = useMemo(() => localMonthBounds(), [])
  const today = localDateString()
  const currentYm = yearMonth(today)

  // History table filters (independent of charts)
  const [status, setStatus] = useState<AttendanceDayStatus | ''>('')
  const [from, setFrom] = useState(bounds.from)
  const [to, setTo] = useState(bounds.to)
  const [applied, setApplied] = useState({
    status: '' as AttendanceDayStatus | '',
    from: bounds.from,
    to: bounds.to,
  })

  // Four chart filters — each works on its own
  const [activityYm, setActivityYm] = useState(currentYm)
  const [activityStatus, setActivityStatus] = useState<AttendanceDayStatus | ''>('')
  const [clockInYm, setClockInYm] = useState(currentYm)
  const [hoursWeekFrom, setHoursWeekFrom] = useState(() => mondayOfWeek(today))
  const [monthlyHoursYm, setMonthlyHoursYm] = useState(currentYm)

  const [downloading, setDownloading] = useState(false)
  const [editDay, setEditDay] = useState<AttendanceDay | null>(null)
  const [tablePage, setTablePage] = useState(1)

  // Fetch the full filtered range once; paginate rows on the client.
  const tableParams = {
    from: applied.from,
    to: applied.to,
    status: applied.status || undefined,
    page: 1,
    limit: 100,
  }

  const chartsRange = useMemo(() => {
    const activity = monthBoundsFromYm(activityYm)
    const clockIn = monthBoundsFromYm(clockInYm)
    const monthly = monthBoundsFromYm(monthlyHoursYm)
    const weekTo = addLocalDays(hoursWeekFrom, 6)
    const fromDate = [activity.from, clockIn.from, monthly.from, hoursWeekFrom].sort()[0]!
    const toDate = [activity.to, clockIn.to, monthly.to, weekTo, today].sort().at(-1)!
    return { from: fromDate, to: toDate > today ? today : toDate }
  }, [activityYm, clockInYm, monthlyHoursYm, hoursWeekFrom, today])

  const chartParams = {
    from: chartsRange.from,
    to: chartsRange.to,
    page: 1,
    limit: 100,
  }

  const mineTable = useMyAttendance(tableParams, { enabled: Boolean(self) })
  const empTable = useEmployeeAttendance(self ? undefined : employeeId, tableParams)
  const tableQuery = self ? mineTable : empTable

  const mineCharts = useMyAttendance(chartParams, { enabled: Boolean(self) })
  const empCharts = useEmployeeAttendance(self ? undefined : employeeId, chartParams)
  const chartsQuery = self ? mineCharts : empCharts

  const data = tableQuery.data
  const chartsData = chartsQuery.data
  const timeZone = data?.summary.timezone ?? data?.summary.today?.timezone
  const { data: settings } = useAttendanceSettings()

  const sessionToday = data?.summary.today
  const profile = self
    ? undefined
    : (data as { profile?: import('@/features/attendance/model/types').AttendanceEmployeeProfile } | undefined)
        ?.profile

  const allTableDays = data?.days ?? []
  const tableTotal = allTableDays.length
  const tableTotalPages = Math.max(1, Math.ceil(tableTotal / TABLE_PAGE_SIZE))
  const safeTablePage = Math.min(tablePage, tableTotalPages)
  const pagedDays = useMemo(() => {
    const start = (safeTablePage - 1) * TABLE_PAGE_SIZE
    return allTableDays.slice(start, start + TABLE_PAGE_SIZE)
  }, [allTableDays, safeTablePage])

  const chartDays = chartsData?.summary.chartDays ?? []
  const monthActivity = chartsData?.summary.monthActivity ?? []
  const expectedHours = settings?.fullDayHours ?? 8

  const clockInBounds = useMemo(() => {
    const next = monthBoundsFromYm(clockInYm)
    return { from: next.from, to: next.to > today ? today : next.to }
  }, [clockInYm, today])

  const clockIn = useMemo(
    () => clockInCountsForRange(chartDays, clockInBounds.from, clockInBounds.to),
    [chartDays, clockInBounds],
  )

  const personalHours = useMemo(
    () =>
      buildPersonalWorkingHoursWeek({
        days: chartDays,
        weekFrom: hoursWeekFrom,
        expectedHours,
      }),
    [chartDays, hoursWeekFrom, expectedHours],
  )

  const monthlyBounds = useMemo(() => {
    const next = monthBoundsFromYm(monthlyHoursYm)
    return { from: next.from, to: next.to > today ? today : next.to }
  }, [monthlyHoursYm, today])

  const monthHours = useMemo(
    () =>
      buildPersonalWorkingHoursRange({
        days: chartDays,
        from: monthlyBounds.from,
        to: monthlyBounds.to,
        expectedHours,
        labelMode: 'day',
      }),
    [chartDays, monthlyBounds, expectedHours],
  )

  const applyRange = (nextFrom: string, nextTo: string, nextStatus = applied.status) => {
    setFrom(nextFrom)
    setTo(nextTo)
    setStatus(nextStatus)
    setTablePage(1)
    setApplied({ status: nextStatus, from: nextFrom, to: nextTo })
  }

  const handleDownload = async () => {
    if (!employeeId && !self) return
    setDownloading(true)
    try {
      const blob = await attendanceApi.exportCsv({
        employeeId: self ? undefined : employeeId,
        from: applied.from,
        to: applied.to,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to download report'))
    } finally {
      setDownloading(false)
    }
  }

  const chartsUpdating = chartsQuery.isFetching && Boolean(chartsData)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-[28px] font-bold leading-9 text-[#1E293B] sm:text-[30px]">
          {self ? 'My Attendance' : 'Attendance Details'}
        </h1>
        <p className="mt-1 text-sm leading-6 text-[#64748B] sm:text-base">
          {self
            ? 'Review your attendance history and working hours'
            : 'View and manage employee attendance information'}
          {(tableQuery.isFetching && data) || chartsUpdating ? (
            <span className="ml-2 text-xs text-text-muted">Updating…</span>
          ) : null}
        </p>
      </header>

      {profile && <AttendanceProfileCard profile={profile} />}

      <AttendanceDetailStats
        checkIn={sessionToday?.clockInAt ?? null}
        checkOut={sessionToday?.clockOutAt ?? null}
        workHoursToday={sessionToday?.workHoursLabel ?? '0h 00m'}
        workingDaysThisMonth={data?.summary.workingDaysThisMonth ?? 0}
        timeZone={timeZone}
      />

      <section className="mb-6 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(0,1.4fr)_300px]">
        <MonthActivityCalendar
          days={monthActivity}
          timeZone={timeZone}
          monthValue={activityYm}
          maxMonth={currentYm}
          statusFilter={activityStatus}
          onStatusFilterChange={setActivityStatus}
          onMonthChange={(ym) => setActivityYm(clampYm(ym, currentYm))}
        />
        <ClockInStatusDonut
          onTime={clockIn.onTime}
          late={clockIn.late}
          notArrived={clockIn.notArrived}
          onTimePercent={clockIn.onTimePercent}
          periodLabel={formatMonthRangeLabel(clockInBounds.from, clockInBounds.to)}
          filter={
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="sr-only">Month</span>
              <input
                type="month"
                value={clockInYm}
                max={currentYm}
                onChange={(e) => {
                  const next = e.target.value
                  if (!next) return
                  setClockInYm(clampYm(next, currentYm))
                }}
                className={periodControlClass}
              />
            </label>
          }
        />
      </section>

      <section className="mb-6 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
        <WorkingHoursChart
          totalHours={personalHours.totalHours}
          expectedTotal={personalHours.expectedTotal}
          days={personalHours.days}
          title="Working Hours"
          subtitle={self ? 'Your work time this week' : 'Work time this week'}
          periodLabel={formatWeekRangeLabel(hoursWeekFrom)}
          showExpectedBars
          filter={
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <span>Week of</span>
              <input
                type="date"
                value={hoursWeekFrom}
                max={today}
                onChange={(e) => {
                  if (!e.target.value) return
                  const next = mondayOfWeek(e.target.value)
                  setHoursWeekFrom(next > today ? mondayOfWeek(today) : next)
                }}
                className={periodControlClass}
              />
            </label>
          }
        />
        <WorkingHoursChart
          totalHours={monthHours.totalHours}
          expectedTotal={monthHours.expectedTotal}
          days={monthHours.days}
          title="Monthly Working Hours"
          subtitle={self ? 'Your work time this month' : 'Work time this month'}
          periodLabel={formatMonthRangeLabel(monthlyBounds.from, monthlyBounds.to)}
          variant="area"
          filter={
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="sr-only">Month</span>
              <input
                type="month"
                value={monthlyHoursYm}
                max={currentYm}
                onChange={(e) => {
                  const next = e.target.value
                  if (!next) return
                  setMonthlyHoursYm(clampYm(next, currentYm))
                }}
                className={periodControlClass}
              />
            </label>
          }
        />
      </section>

      <AttendanceHistoryToolbar
        status={status}
        from={from}
        to={to}
        onStatusChange={setStatus}
        onFromChange={setFrom}
        onToChange={setTo}
        onApply={() => applyRange(from, to, status)}
        onReset={() => applyRange(bounds.from, bounds.to, '')}
        onDownload={handleDownload}
        downloading={downloading}
      />

      {tableQuery.isLoading && !data && (
        <p className="text-sm text-text-muted">Loading history…</p>
      )}
      {tableQuery.isError && !data && (
        <p className="text-sm text-[#DC2626]">Unable to load attendance history.</p>
      )}

      {data && (
        <AttendanceDetailHistoryTable
          days={pagedDays}
          pagination={{
            page: safeTablePage,
            limit: TABLE_PAGE_SIZE,
            total: tableTotal,
            totalPages: tableTotalPages,
          }}
          onPageChange={setTablePage}
          timeZone={timeZone}
          canCorrect={canManage && !self}
          onCorrect={canManage && !self ? setEditDay : undefined}
        />
      )}

      <CorrectAttendanceDayModal day={editDay} onClose={() => setEditDay(null)} />
    </div>
  )
}

export function AttendanceDetailPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  return <AttendanceDetailView employeeId={employeeId} />
}

export function MyAttendancePage() {
  const { user } = useAuth()
  return <AttendanceDetailView employeeId={user?.id} self />
}
