import type { ReactNode } from 'react'
import type { AnalyticsFilters, PerformanceOptions } from '@/features/performance/model/contracts'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

type AnalyticsFiltersBarProps = {
  filters: AnalyticsFilters
  options: PerformanceOptions
  onChange: (filters: AnalyticsFilters) => void
  onReset: () => void
  onApply: () => void
}

const selectClass =
  '!h-10 w-full rounded-lg border border-[#e2e8f0] bg-surface px-3 text-sm text-heading sm:w-auto'

type FilterSelectProps = {
  value: string
  onValueChange: (value: string) => void
  ariaLabel: string
  className?: string
  children: ReactNode
}

function FilterSelect({ value, onValueChange, ariaLabel, className, children }: FilterSelectProps) {
  return (
    <div className="w-full lg:w-auto">
      <SelectField
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(selectClass, className)}
        aria-label={ariaLabel}
      >
        {children}
      </SelectField>
    </div>
  )
}

export function AnalyticsFiltersBar({
  filters,
  options,
  onChange,
  onReset,
  onApply,
}: AnalyticsFiltersBarProps) {
  const ratingOptions = ['Any Rating', '4+', '3-4', 'below3']

  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
          <FilterSelect
            value={filters.department ?? 'All Departments'}
            onValueChange={(value) => onChange({ ...filters, department: value })}
            ariaLabel="Filter by department"
          >
            {options.departments.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filters.manager ?? 'All Managers'}
            onValueChange={(value) => onChange({ ...filters, manager: value })}
            ariaLabel="Filter by manager"
          >
            {options.managers.map((opt) => (
              <option key={opt.id} value={opt.id === 'all' ? 'All Managers' : opt.id}>
                {opt.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filters.ratingRange ?? 'Any Rating'}
            onValueChange={(value) => onChange({ ...filters, ratingRange: value })}
            ariaLabel="Filter by rating range"
          >
            {ratingOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filters.periodStart ?? options.periods[0]?.periodStart ?? ''}
            onValueChange={(value) => onChange({ ...filters, periodStart: value })}
            ariaLabel="Filter by period"
          >
            {options.periods.map((period) => (
              <option key={period.periodStart} value={period.periodStart}>
                {period.periodLabel}
              </option>
            ))}
          </FilterSelect>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="h-10 flex-1 rounded-lg border border-border px-4 text-sm font-semibold text-heading hover:bg-surface-muted sm:flex-none"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 flex-1 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:flex-none"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
