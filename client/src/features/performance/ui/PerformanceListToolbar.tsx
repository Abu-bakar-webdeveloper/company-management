import { SearchIcon } from '@/app/shell/icons'
import type { PerformanceListFilters } from '@/features/performance/model/types'
import { SelectField } from '@/shared/ui/SelectField'

type PerformanceListToolbarProps = {
  filters: PerformanceListFilters
  onChange: (filters: PerformanceListFilters) => void
  onReset: () => void
}

const selectClass =
  '!h-10 w-full min-w-0 shrink-0 rounded-lg border border-[#e2e8f0] bg-surface px-3 text-sm text-heading sm:w-auto'

export function PerformanceListToolbar({
  filters,
  onChange,
  onReset,
}: PerformanceListToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search tasks, employees..."
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <SelectField
            value={filters.rating ?? 'all'}
            onChange={(e) =>
              onChange({ ...filters, rating: e.target.value as PerformanceListFilters['rating'] })
            }
            className={selectClass}
            aria-label="Filter by rating"
          >
            <option value="all">Rating</option>
            <option value="4+">4+ Stars</option>
            <option value="3-4">3-4 Stars</option>
            <option value="below3">Below 3 Stars</option>
          </SelectField>
          <SelectField
            value={filters.status ?? 'all'}
            onChange={(e) =>
              onChange({ ...filters, status: e.target.value as PerformanceListFilters['status'] })
            }
            className={selectClass}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="needs_improvement">Needs Improvement</option>
            <option value="poor">Poor</option>
            <option value="average">Average (legacy)</option>
            <option value="critical">Critical (legacy)</option>
          </SelectField>
          <button
            type="button"
            onClick={onReset}
            className="col-span-2 h-10 rounded-lg px-4 text-sm font-semibold text-text-muted hover:text-heading sm:col-span-1"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
