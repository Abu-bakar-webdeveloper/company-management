import { CalendarIcon } from '@/features/performance/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'
import type { PerformanceOptions } from '@/features/performance/model/contracts'
import { formatCompanyMonthYear } from '@/shared/lib/format'

type PeriodPickerProps = {
  periodStart: string
  periodLabel: string
  periods: PerformanceOptions['periods']
  onChange: (periodStart: string, periodLabel: string) => void
}

export function PeriodPicker({ periodStart, periodLabel, periods, onChange }: PeriodPickerProps) {
  return (
    <SelectField
      value={periodStart}
      onChange={(e) => {
        const selected = periods.find((p) => p.periodStart === e.target.value)
        if (selected) onChange(selected.periodStart, selected.periodLabel)
      }}
      leadingIcon={<CalendarIcon className="size-3.5" />}
      className="!h-10 min-w-[140px] rounded-lg border border-border bg-surface py-0 text-sm font-semibold text-heading"
      aria-label="Select period"
    >
      {periods.map((period) => (
        <option key={period.periodStart} value={period.periodStart}>
          {period.periodLabel}
        </option>
      ))}
      {periods.length === 0 && (
        <option value={periodStart}>{periodLabel}</option>
      )}
    </SelectField>
  )
}

/** Current calendar month as YYYY-MM-01 (UTC), matching server period keys. */
export function getCurrentPeriodStart(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

export function getCurrentPeriodLabel(): string {
  return formatCompanyMonthYear(new Date().toISOString())
}
