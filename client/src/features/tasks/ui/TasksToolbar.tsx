import { SearchIcon } from '@/app/shell/icons'
import type { TaskListFilters } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type TasksToolbarProps = {
  filters: TaskListFilters
  onChange: (filters: TaskListFilters) => void
  onReset: () => void
  onApply: () => void
}

const selectClass =
  '!h-10 w-full min-w-0 shrink-0 rounded-lg border-[#e2e8f0] bg-surface px-3 text-sm text-heading sm:w-auto sm:min-w-[120px]'

export function TasksToolbar({ filters, onChange, onReset, onApply }: TasksToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] shrink-0 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search Tasks"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <ChevronSelect
            value={filters.progress}
            onChange={(e) =>
              onChange({
                ...filters,
                progress: e.target.value as TaskListFilters['progress'],
              })
            }
            className={selectClass}
            aria-label="Filter by progress"
          >
            <option value="all">All Progress</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </ChevronSelect>

          <ChevronSelect
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as TaskListFilters['status'],
              })
            }
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="hold">Hold</option>
            <option value="overdue">Overdue</option>
          </ChevronSelect>

          <button
            type="button"
            onClick={onReset}
            className="h-10 w-full shrink-0 rounded-lg border border-[#e2e8f0] bg-surface px-5 text-sm font-medium text-heading hover:bg-surface-muted sm:w-auto"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onApply}
            className={cn(
              'h-10 w-full shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-white sm:w-auto',
              'shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95',
            )}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
