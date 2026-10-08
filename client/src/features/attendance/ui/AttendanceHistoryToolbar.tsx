import type { AttendanceDayStatus } from '@/features/attendance/model/types'
import { SelectField } from '@/shared/ui/SelectField'

type AttendanceHistoryToolbarProps = {
  status: AttendanceDayStatus | ''
  from: string
  to: string
  onStatusChange: (status: AttendanceDayStatus | '') => void
  onFromChange: (from: string) => void
  onToChange: (to: string) => void
  onApply: () => void
  onReset: () => void
  onDownload?: () => void
  downloading?: boolean
}

export function AttendanceHistoryToolbar({
  status,
  from,
  to,
  onStatusChange,
  onFromChange,
  onToChange,
  onApply,
  onReset,
  onDownload,
  downloading,
}: AttendanceHistoryToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border-card bg-surface p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-text-muted">Status</span>
          <SelectField
            value={status}
            onChange={(e) => onStatusChange(e.target.value as AttendanceDayStatus | '')}
            className="!h-10 w-full rounded-lg text-sm"
          >
            <option value="">All</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on_leave">On Leave</option>
            <option value="half_day">Half Day</option>
          </SelectField>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text-muted">From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-white px-3 py-2 text-sm text-heading"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-text-muted">To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="w-full rounded-lg border border-border-card bg-white px-3 py-2 text-sm text-heading"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        {onDownload && (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="rounded-lg border border-border-card px-3 py-2 text-sm font-medium text-heading hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            Download Report
          </button>
        )}
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:text-heading"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-lg bg-[#136DEC] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
