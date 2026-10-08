import { useId } from 'react'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

export const MONTH_RANGE_OPTIONS = [
  { value: 3, label: 'Last 3 Months' },
  { value: 6, label: 'Last 6 Months' },
  { value: 12, label: 'Last 12 Months' },
] as const

export type MonthRange = (typeof MONTH_RANGE_OPTIONS)[number]['value']

type MonthRangeFilterProps = {
  value: MonthRange
  onChange: (months: MonthRange) => void
  className?: string
  size?: 'sm' | 'md'
}

export function MonthRangeFilter({
  value,
  onChange,
  className,
  size = 'md',
}: MonthRangeFilterProps) {
  const id = useId()

  return (
    <SelectField
      id={id}
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value) as MonthRange)}
      aria-label="Time range"
      className={cn(
        'rounded-full border-0 bg-border-card pr-7 font-normal text-heading hover:bg-[#e2e8f0]',
        size === 'sm' ? '!h-6 pl-3 text-xs lg:!h-7 lg:text-sm' : '!h-7 pl-3 text-sm',
        className,
      )}
    >
      {MONTH_RANGE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  )
}
