import { SearchIcon } from '@/app/shell/icons'
import { departmentOptions, MONTH_OPTIONS, statusLabels } from '@/features/salaries/model/salariesData'
import type { SalaryListFilters } from '@/features/salaries/model/types'
import { CalendarIcon, UsersIcon } from '@/features/salaries/ui/icons'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type SalaryToolbarProps = {
  filters: SalaryListFilters
  onChange: (filters: SalaryListFilters) => void
  employeeOptions: { id: string; name: string }[]
}

const selectClass =
  '!h-10 w-full min-w-0 rounded-lg border border-[#e2e8f0] bg-surface px-3 text-sm text-heading'

const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 6 }, (_, i) => current - i)
})()

export function SalaryToolbar({ filters, onChange, employeeOptions }: SalaryToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="relative min-w-0 w-full">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] shrink-0 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search employee or employee ID..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-11 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <ChevronSelect
            value={filters.department}
            onChange={(e) => onChange({ ...filters, department: e.target.value })}
            className={selectClass}
            aria-label="Filter by department"
          >
            <option value="all">Department</option>
            {departmentOptions.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as SalaryListFilters['status'] })
            }
            className={selectClass}
            aria-label="Filter by payroll status"
          >
            <option value="all">Payroll Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            leadingIcon={<CalendarIcon className="size-3.5" />}
            value={filters.month === 'all' ? 'all' : String(filters.month)}
            onChange={(e) => {
              const v = e.target.value
              onChange({
                ...filters,
                month: v === 'all' ? 'all' : Number(v),
              })
            }}
            className={selectClass}
            aria-label="Filter by month"
          >
            <option value="all">All Months</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            value={filters.year === 'all' ? 'all' : String(filters.year)}
            onChange={(e) => {
              const v = e.target.value
              onChange({
                ...filters,
                year: v === 'all' ? 'all' : Number(v),
              })
            }}
            className={selectClass}
            aria-label="Filter by year"
          >
            <option value="all">All Years</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            leadingIcon={<UsersIcon className="size-3.5" />}
            value={filters.employeeId}
            onChange={(e) => onChange({ ...filters, employeeId: e.target.value })}
            className={selectClass}
            aria-label="Filter by employee"
          >
            <option value="all">All Employees</option>
            {employeeOptions.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </ChevronSelect>
        </div>
      </div>
    </div>
  )
}
