import { useMemo } from 'react'
import {
  formatDateLabel,
  formatTimeLabel,
  localDateString,
  monthBoundsFromYm,
  yearMonth,
} from '@/features/attendance/lib/attendance-utils'
import type { AttendanceDayStatus, MonthActivityDay } from '@/features/attendance/model/types'
import { useAttendanceHoverTip } from '@/features/attendance/ui/AttendanceHoverTip'
import { cn } from '@/shared/lib/cn'
import { SelectField } from '@/shared/ui/SelectField'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_CELL: Record<AttendanceDayStatus, string> = {
  present: 'bg-[#34D399]',
  late: 'bg-[#FB923C]',
  half_day: 'bg-[#A78BFA]',
  absent: 'bg-[#F87171]',
  on_leave: 'bg-[#60A5FA]',
  weekend: 'bg-[#E2E8F0]',
  holiday: 'bg-[#E2E8F0]',
  not_arrived: 'bg-[#FDE68A]',
}

const STATUS_LABEL: Record<AttendanceDayStatus, string> = {
  present: 'Present',
  late: 'Late',
  half_day: 'Half day',
  absent: 'Absent',
  on_leave: 'On leave',
  weekend: 'Weekend',
  holiday: 'Holiday',
  not_arrived: 'Not arrived',
}

type GridCell = {
  date: string
  day: MonthActivityDay | null
  isFuture: boolean
}

function weekdayIndexMondayFirst(dateStr: string): number {
  const d = new Date(`${dateStr}T12:00:00`)
  const js = d.getDay()
  return js === 0 ? 6 : js - 1
}

/** Full calendar weeks for a YYYY-MM month (always every day of that month). */
function buildMonthWeeks(
  monthValue: string,
  days: MonthActivityDay[],
  today: string,
): Array<Array<GridCell | null>> {
  const { from, to } = monthBoundsFromYm(monthValue)
  const byDate = new Map(days.map((d) => [d.date, d]))
  const padStart = weekdayIndexMondayFirst(from)

  const cells: Array<GridCell | null> = []
  for (let i = 0; i < padStart; i++) cells.push(null)

  const cursor = new Date(`${from}T12:00:00`)
  const end = new Date(`${to}T12:00:00`)
  while (cursor <= end) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const dayNum = String(cursor.getDate()).padStart(2, '0')
    const key = `${y}-${m}-${dayNum}`
    cells.push({
      date: key,
      day: byDate.get(key) ?? null,
      isFuture: key > today,
    })
    cursor.setDate(cursor.getDate() + 1)
  }

  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: Array<Array<GridCell | null>> = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

function tooltipLines(
  cell: GridCell,
  timeZone?: string,
): string[] {
  if (cell.isFuture) {
    return [`${formatDateLabel(cell.date)} — Upcoming`]
  }
  if (!cell.day) {
    return [`${formatDateLabel(cell.date)} — No record`]
  }
  const day = cell.day
  const lines = [
    `${formatDateLabel(day.date)} — ${STATUS_LABEL[day.status]}`,
    `In ${formatTimeLabel(day.clockInAt, timeZone)} · Out ${formatTimeLabel(day.clockOutAt, timeZone)}`,
    `${day.workHoursLabel} · ${day.tasksCompleted} task${day.tasksCompleted === 1 ? '' : 's'}`,
  ]
  if (day.taskTitles.length > 0) {
    lines.push(...day.taskTitles.map((t) => `· ${t}`))
    if (day.tasksCompleted > day.taskTitles.length) {
      lines.push(`· +${day.tasksCompleted - day.taskTitles.length} more`)
    }
  }
  return lines
}

export function MonthActivityCalendar({
  days,
  timeZone,
  monthValue,
  statusFilter = '',
  onStatusFilterChange,
  onMonthChange,
  maxMonth,
}: {
  days: MonthActivityDay[]
  timeZone?: string
  /** YYYY-MM for the month dropdown */
  monthValue: string
  statusFilter?: AttendanceDayStatus | ''
  onStatusFilterChange?: (status: AttendanceDayStatus | '') => void
  onMonthChange?: (ym: string) => void
  /** Latest selectable month (YYYY-MM); defaults to current month */
  maxMonth?: string
}) {
  const today = localDateString()
  const currentYm = maxMonth ?? yearMonth(today)
  const safeMonth = monthValue > currentYm ? currentYm : monthValue

  const weeks = useMemo(
    () => buildMonthWeeks(safeMonth, days, today),
    [days, safeMonth, today],
  )
  const { show, hide, node: tipNode } = useAttendanceHoverTip()

  return (
    <div className="flex h-full flex-col rounded-xl border border-border-card bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-heading sm:text-base">Month activity</h3>
          <p className="mt-0.5 text-[11px] text-text-muted sm:text-xs">
            Attendance and tasks by day
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onMonthChange && (
            <label className="flex items-center gap-1.5 text-xs text-text-muted">
              <span className="sr-only">Month</span>
              <input
                type="month"
                value={safeMonth}
                max={currentYm}
                onChange={(e) => {
                  const next = e.target.value
                  if (!next || next > currentYm) return
                  onMonthChange(next)
                }}
                className="rounded-md border border-border-card bg-white px-2 py-1.5 text-xs font-medium text-heading"
              />
            </label>
          )}
          {onStatusFilterChange && (
            <SelectField
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as AttendanceDayStatus | '')
              }
              className="!h-8 min-w-[132px] rounded-md px-2 py-0 text-xs"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On leave</option>
              <option value="half_day">Half day</option>
              <option value="weekend">Weekend</option>
              <option value="not_arrived">Not arrived</option>
            </SelectField>
          )}
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <div className="grid w-full grid-cols-7 gap-1.5 text-center text-[11px] font-medium text-text-muted sm:gap-2">
          {DAY_LABELS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="mt-1.5 flex flex-1 flex-col gap-1.5 sm:gap-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid min-h-0 flex-1 grid-cols-7 gap-1.5 sm:gap-2">
              {week.map((cell, di) => {
                if (!cell) {
                  return (
                    <div
                      key={`empty-${wi}-${di}`}
                      className="min-h-9 rounded-md bg-transparent sm:min-h-10"
                    />
                  )
                }

                const status = cell.day?.status
                const dimmed = Boolean(
                  statusFilter && status && status !== statusFilter,
                )
                const hasTasks = (cell.day?.tasksCompleted ?? 0) > 0
                const tip = tooltipLines(cell, timeZone)

                return (
                  <button
                    key={cell.date}
                    type="button"
                    aria-label={tip.join(', ')}
                    className={cn(
                      'relative flex min-h-9 w-full items-center justify-center rounded-md text-[10px] font-semibold transition-opacity sm:min-h-10 sm:text-xs',
                      cell.isFuture
                        ? 'border border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]'
                        : status
                          ? cn(
                              STATUS_CELL[status],
                              status === 'weekend' || status === 'holiday'
                                ? 'text-[#64748B]'
                                : 'text-white',
                            )
                          : 'bg-[#F1F5F9] text-[#94A3B8]',
                      dimmed && 'opacity-25',
                      'hover:ring-2 hover:ring-[#136DEC]/35 hover:ring-offset-1',
                    )}
                    onMouseEnter={(e) => show(e.currentTarget, tip)}
                    onMouseLeave={hide}
                    onFocus={(e) => show(e.currentTarget, tip)}
                    onBlur={hide}
                  >
                    {Number(cell.date.slice(-2))}
                    {hasTasks && !cell.isFuture && (
                      <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[#0F172A] ring-1 ring-white/70" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-muted sm:text-[11px]">
          {(
            [
              ['present', 'Present'],
              ['late', 'Late'],
              ['absent', 'Absent'],
              ['on_leave', 'Leave'],
              ['half_day', 'Half'],
              ['weekend', 'Off'],
            ] as const
          ).map(([key, label]) => (
            <span key={key} className="inline-flex items-center gap-1">
              <span className={cn('size-2.5 rounded-[2px]', STATUS_CELL[key])} />
              {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#0F172A]" />
            Tasks
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="size-2.5 rounded-[2px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC]" />
            Upcoming
          </span>
        </div>
      </div>
      {tipNode}
    </div>
  )
}
