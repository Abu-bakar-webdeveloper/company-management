import { SearchIcon } from '@/app/shell/icons'
import { categoryLabels, expenseTypeLabels, statusLabels } from '@/features/expenses/model/expensesData'
import type { ExpenseListFilters } from '@/features/expenses/model/types'
import { BriefcaseIcon, CalendarIcon, UsersIcon } from '@/features/expenses/ui/icons'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type ExpenseToolbarProps = {
  filters: ExpenseListFilters
  onChange: (filters: ExpenseListFilters) => void
  employeeOptions: { id: string; name: string }[]
  projectOptions: { id: string; name: string }[]
}

const selectClass =
  '!h-10 !w-full shrink-0 rounded-lg border border-[#e2e8f0] bg-surface px-3 text-sm text-heading sm:!w-auto'

export function ExpenseToolbar({
  filters,
  onChange,
  employeeOptions,
  projectOptions,
}: ExpenseToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="relative min-w-0 w-full">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] shrink-0 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search employee or request ID..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-11 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-2">
          <ChevronSelect
            value={filters.expenseType}
            onChange={(e) =>
              onChange({
                ...filters,
                expenseType: e.target.value as ExpenseListFilters['expenseType'],
              })
            }
            className={selectClass}
            aria-label="Filter by expense type"
          >
            <option value="all">All Types</option>
            {Object.entries(expenseTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            value={filters.category}
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value as ExpenseListFilters['category'] })
            }
            className={selectClass}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            value={filters.status}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as ExpenseListFilters['status'] })
            }
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ChevronSelect>

          <ChevronSelect
            leadingIcon={<CalendarIcon className="size-3.5" />}
            value={filters.period}
            onChange={(e) =>
              onChange({ ...filters, period: e.target.value as ExpenseListFilters['period'] })
            }
            className={selectClass}
            aria-label="Filter by period"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
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

          <ChevronSelect
            leadingIcon={<BriefcaseIcon className="size-3.5" />}
            value={filters.projectId}
            onChange={(e) => onChange({ ...filters, projectId: e.target.value })}
            className={selectClass}
            aria-label="Filter by project"
          >
            <option value="all">All Projects</option>
            {projectOptions.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </ChevronSelect>
        </div>
      </div>
    </div>
  )
}
