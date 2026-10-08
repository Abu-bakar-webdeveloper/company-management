import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { EmployeeListFilters } from '@/features/employees/model/types'
import { departmentLabels, statusLabels } from '@/features/employees/model/employeesData'
import { SearchIcon } from '@/app/shell/icons'
import { ExportIcon, FiltersIcon } from '@/features/employees/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'
import { cn } from '@/shared/lib/cn'

type EmployeeToolbarProps = {
  filters: EmployeeListFilters
  onChange: (filters: EmployeeListFilters) => void
}

export function EmployeeToolbar({ filters, onChange }: EmployeeToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search employees by name, role, or department..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-11 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0 sm:items-center">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={cn(
              'flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-heading hover:bg-surface-muted',
              filtersOpen && 'border-[#1877f2] bg-[#eff6ff] text-[#1877f2]',
            )}
          >
            <FiltersIcon />
            Filters
          </button>
          <Link
            to="/reports/generate?type=employees"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-heading hover:bg-surface-muted"
          >
            <ExportIcon />
            Export
          </Link>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border-card pt-4 sm:flex-row">
          <SelectField
            value={filters.department}
            onChange={(e) =>
              onChange({
                ...filters,
                department: e.target.value as EmployeeListFilters['department'],
              })
            }
            className="!h-10 w-full min-w-0 text-sm sm:min-w-[180px]"
            aria-label="Filter by department"
          >
            <option value="all">All Departments</option>
            {Object.entries(departmentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>

          <SelectField
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as EmployeeListFilters['status'],
              })
            }
            className="!h-10 w-full min-w-0 text-sm sm:min-w-[160px]"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectField>
        </div>
      )}
    </div>
  )
}
