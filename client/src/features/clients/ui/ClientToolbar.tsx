import type { ClientListFilters, ClientStatus } from '@/features/clients/model/types'
import { SearchIcon } from '@/app/shell/icons'
import { SelectField } from '@/shared/ui/SelectField'

type ClientToolbarProps = {
  filters: ClientListFilters
  onChange: (filters: ClientListFilters) => void
}

export function ClientToolbar({ filters, onChange }: ClientToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search clients..."
            className="h-11 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>
        <div className="w-full sm:w-44 sm:shrink-0">
          <SelectField
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as ClientStatus | 'all',
              })
            }
            className="h-11 w-full rounded-lg text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </SelectField>
        </div>
      </div>
    </div>
  )
}
