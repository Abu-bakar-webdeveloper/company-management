import type { WorkRhythmCell } from '@/features/attendance/model/types'
import { useAttendanceHoverTip } from '@/features/attendance/ui/AttendanceHoverTip'
import { cn } from '@/shared/lib/cn'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ACTIVE_RGB = '19, 109, 236' // #136DEC
const EMPTY_BG = '#F1F5F9'

function cellBackground(intensity: number): string {
  if (intensity <= 0) return EMPTY_BG
  // Soft floor so a single event is still visible; max is solid brand blue.
  const alpha = Math.min(1, 0.2 + intensity * 0.8)
  return `rgba(${ACTIVE_RGB}, ${alpha.toFixed(3)})`
}

function cellTooltip(dayLabel: string, hour: number, cell: WorkRhythmCell | undefined): string[] {
  const checkIns = cell?.checkIns ?? 0
  const tasks = cell?.tasksCompleted ?? 0
  if (checkIns === 0 && tasks === 0) {
    return [`${dayLabel} ${hour}:00`, 'No check-ins or tasks']
  }
  return [
    `${dayLabel} ${hour}:00`,
    `Check-ins: ${checkIns}`,
    `Tasks done: ${tasks}`,
  ]
}

export function WorkRhythmHeatmap({
  cells,
  hourFrom = 9,
  hourTo = 19,
  weekFrom,
  onWeekChange,
}: {
  cells: WorkRhythmCell[]
  hourFrom?: number
  hourTo?: number
  /** Monday YYYY-MM-DD of the selected week */
  weekFrom?: string
  onWeekChange?: (weekFrom: string) => void
}) {
  const hours = Array.from({ length: hourTo - hourFrom + 1 }, (_, i) => hourFrom + i)
  const map = new Map(cells.map((c) => [`${c.day}:${c.hour}`, c]))
  const { show, hide, node: tipNode } = useAttendanceHoverTip()

  return (
    <div className="rounded-xl border border-border-card bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-heading sm:text-base">Work Rhythm</h3>
          <p className="mt-0.5 text-[11px] text-text-muted sm:text-xs">
            Color intensity from check-ins and completed tasks
          </p>
        </div>
        {onWeekChange && weekFrom && (
          <label className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>Week of</span>
            <input
              type="date"
              value={weekFrom}
              onChange={(e) => {
                if (!e.target.value) return
                onWeekChange(e.target.value)
              }}
              className="rounded-md border border-border-card bg-white px-2 py-1.5 text-xs font-medium text-heading"
            />
          </label>
        )}
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[360px]">
          <div className="mb-1.5 grid grid-cols-[36px_repeat(7,1fr)] gap-1 text-center text-[10px] text-text-muted">
            <span />
            {DAY_LABELS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          {hours.map((hour) => (
            <div key={hour} className="mb-1 grid grid-cols-[36px_repeat(7,1fr)] gap-1">
              <span className="text-[10px] leading-4 text-text-muted">{hour}:00</span>
              {DAY_LABELS.map((dayLabel, idx) => {
                const day = idx + 1
                const key = `${day}:${hour}`
                const cell = map.get(key)
                const intensity = cell?.intensity ?? 0
                const tip = cellTooltip(dayLabel, hour, cell)
                return (
                  <div
                    key={key}
                    className={cn('h-4 cursor-default rounded-[3px]')}
                    style={{ backgroundColor: cellBackground(intensity) }}
                    onMouseEnter={(e) => show(e.currentTarget, tip)}
                    onMouseLeave={hide}
                  />
                )
              })}
            </div>
          ))}
          <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted">
            <span>Less</span>
            {[0, 0.25, 0.5, 0.75, 1].map((level) => (
              <span
                key={level}
                className="size-3 rounded-[2px]"
                style={{ backgroundColor: cellBackground(level) }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
      {tipNode}
    </div>
  )
}
