import { departmentOptions, roleOptions, statusOptions } from '@/features/settings/model/settingsData'
import type { UserListFilters } from '@/features/settings/model/types'
import { SearchIcon } from '@/features/settings/ui/icons'
import { SelectField } from '@/shared/ui/SelectField'

type UsersToolbarProps = {
  filters: UserListFilters
  onChange: (filters: UserListFilters) => void
  onReset: () => void
}

export function UsersToolbar({ filters, onChange, onReset }: UsersToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-4 shadow-[var(--shadow-stat)]">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
          <div className="relative w-full lg:w-56">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              placeholder="Search by name or email..."
              aria-label="Search users"
              className="h-10 w-full rounded-lg border border-[#e2e8f0] bg-surface pl-9 pr-3 text-sm text-heading outline-none placeholder:text-placeholder-alt focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          {[
            { key: 'role' as const, options: ['All Roles', ...roleOptions] },
            { key: 'status' as const, options: statusOptions },
            { key: 'department' as const, options: departmentOptions },
          ].map(({ key, options }) => (
            <div key={key} className="w-full lg:w-auto">
              <SelectField
                value={filters[key]}
                onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
                aria-label={`Filter by ${key}`}
                className="!h-10 w-full rounded-lg border-[#e2e8f0] px-3 text-sm lg:w-auto"
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </SelectField>
            </div>
          ))}
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
            className="h-10 flex-1 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95 sm:flex-none"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
