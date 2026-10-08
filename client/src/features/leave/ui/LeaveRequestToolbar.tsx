import { useMemo, useState } from 'react'
import { SearchIcon } from '@/app/shell/icons'
import type { LeaveRequestFilters } from '@/features/leave/model/types'
import type { LeaveType } from '@/features/leave/model/types'
import { requestStatusFilterLabels } from '@/features/leave/model/leaveData'
import { CalendarIcon } from '@/features/leave/ui/icons'
import { formatCompanyMonthYear } from '@/shared/lib/format'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

type LeaveRequestToolbarProps = {
  filters: LeaveRequestFilters
  leaveTypes: LeaveType[]
  onChange: (filters: LeaveRequestFilters) => void
}

function FiltersIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M2 4h14M5 9h8M8 14h2" strokeLinecap="round" />
    </svg>
  )
}

function buildMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = []
  const now = new Date()

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = formatCompanyMonthYear(date.toISOString())
    options.push({ value, label })
  }

  return options
}

export function LeaveRequestToolbar({ filters, leaveTypes, onChange }: LeaveRequestToolbarProps) {
  const monthOptions = useMemo(() => buildMonthOptions(), [])
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search employee or request ID..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-11 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className={cn(
            'flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-heading hover:bg-surface-muted sm:w-auto lg:shrink-0',
            filtersOpen && 'border-[#1877f2] bg-[#eff6ff] text-[#1877f2]',
          )}
        >
          <FiltersIcon />
          Filters
        </button>
      </div>

      {filtersOpen && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-border-card pt-4 sm:grid-cols-3">
          <SelectField
            value={filters.leaveType}
            onChange={(e) => onChange({ ...filters, leaveType: e.target.value })}
            className="h-11 w-full min-w-0 rounded-lg text-sm"
            aria-label="Filter by leave type"
          >
            <option value="all">Leave Type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as LeaveRequestFilters['status'],
              })
            }
            className="h-11 w-full min-w-0 rounded-lg text-sm"
            aria-label="Filter by status"
          >
            <option value="all">Status</option>
            {Object.entries(requestStatusFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>

          <SelectField
            value={filters.month}
            onChange={(e) => onChange({ ...filters, month: e.target.value })}
            leadingIcon={<CalendarIcon />}
            className="h-11 w-full min-w-0 rounded-lg text-sm"
            aria-label="Filter by month"
          >
            <option value="all">All Months</option>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>
      )}
    </div>
  )
}
