import type { ReportsOverviewFilters } from '@/features/reports/model/types'
import { moduleLabels } from '@/features/reports/model/reportsData'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled, REPORT_TYPE_HUB } from '@/features/auth/model/companyHubs'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type ReportsFiltersBarProps = {
  filters: ReportsOverviewFilters
  departmentOptions: string[]
  onChange: (filters: ReportsOverviewFilters) => void
  onReset: () => void
  onApply: () => void
}

type FilterField = {
  key: keyof ReportsOverviewFilters
  label: string
  options: string[]
}

export function ReportsFiltersBar({
  filters,
  departmentOptions,
  onChange,
  onReset,
  onApply,
}: ReportsFiltersBarProps) {
  const { user } = useAuth()
  const moduleOptions = [
    'All Modules',
    ...Object.entries(moduleLabels)
      .filter(([module]) =>
        isCompanyHubEnabled(user?.enabledHubs, REPORT_TYPE_HUB[module as keyof typeof REPORT_TYPE_HUB]),
      )
      .map(([, label]) => label),
  ]
  const fields: FilterField[] = [
    { key: 'module', label: 'MODULE', options: moduleOptions },
    {
      key: 'department',
      label: 'DEPARTMENT',
      options: departmentOptions.length > 0 ? departmentOptions : ['All Departments'],
    },
    {
      key: 'dateRange',
      label: 'DATE RANGE',
      options: ['This Month', 'Last Month', 'This Quarter', 'This Year'],
    },
  ]

  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {fields.map(({ key, label, options }) => (
            <div key={key} className="min-w-0">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-text-muted">
                {label}
              </p>
              <ChevronSelect
                value={filters[key]}
                onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
                aria-label={`Filter by ${label}`}
                className="!h-10 w-full rounded-lg border-[#e2e8f0] bg-surface px-3 text-sm font-medium text-heading"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </ChevronSelect>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 lg:flex lg:shrink-0 lg:items-center lg:pl-2">
          <button
            type="button"
            onClick={onReset}
            className="h-10 rounded-lg border border-[#e2e8f0] bg-surface px-5 text-sm font-semibold text-text-muted hover:bg-surface-muted lg:min-w-[97px]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 lg:min-w-[164px]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
