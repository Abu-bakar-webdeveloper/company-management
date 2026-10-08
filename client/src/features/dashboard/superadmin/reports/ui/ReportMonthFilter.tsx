import { CalendarIcon } from '@/features/platform/ui/icons'
import {
  clampYearMonth,
  currentYearMonth,
  formatYearMonthLabel,
  listYearMonths,
} from '@/features/dashboard/superadmin/reports/lib/report-month'
import { SelectField } from '@/shared/ui/SelectField'

type ReportMonthFilterProps = {
  value: string
  max?: string
  onChange: (month: string) => void
}

export function ReportMonthFilter({ value, max, onChange }: ReportMonthFilterProps) {
  const maxMonth = max ?? currentYearMonth()
  const selected = clampYearMonth(value, maxMonth)
  const months = listYearMonths(24, maxMonth)
  const options = months.includes(selected) ? months : [selected, ...months]

  return (
    <SelectField
      value={selected}
      onChange={(e) => {
        const next = e.target.value
        if (!next) return
        onChange(clampYearMonth(next, maxMonth))
      }}
      leadingIcon={<CalendarIcon className="text-primary" />}
      className="!h-10 min-w-[148px] cursor-pointer rounded-lg border-[#E2E8F0] py-0 text-sm font-semibold hover:bg-surface-muted"
      aria-label="Filter reports by month"
    >
      {options.map((month) => (
        <option key={month} value={month}>
          {formatYearMonthLabel(month)}
        </option>
      ))}
    </SelectField>
  )
}
