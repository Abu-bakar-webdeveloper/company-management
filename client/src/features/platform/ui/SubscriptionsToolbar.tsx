import { Link } from 'react-router-dom'
import { SearchIcon } from '@/app/shell/icons'
import type { SubscriptionListFilters } from '@/features/platform/model/types'
import { EditPenIcon } from '@/features/platform/ui/icons'
import { cn } from '@/shared/lib/cn'
import { ChevronSelect } from '@/shared/ui/ChevronSelect'

type SubscriptionsToolbarProps = {
  filters: SubscriptionListFilters
  onChange: (filters: SubscriptionListFilters) => void
  onReset: () => void
  onApply: () => void
}

export function SubscriptionsToolbar({
  filters,
  onChange,
  onReset,
  onApply,
}: SubscriptionsToolbarProps) {
  return (
    <div className="mb-6 rounded-xl border border-border-card bg-surface p-3 shadow-[var(--shadow-stat)] sm:p-4">
      {/* Mobile + tablet */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-[18px] shrink-0 -translate-y-1/2 text-text-muted sm:left-4" />
            <input
              type="search"
              placeholder="Search companies, plans"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="h-10 w-full rounded-lg border-0 bg-[#f1f5f9] pl-10 pr-3 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20 sm:pl-11 sm:pr-4"
            />
          </div>
          <Link
            to="/subscriptions/new"
            className={cn(
              'hidden h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5',
              'text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95',
              'sm:inline-flex',
            )}
          >
            <EditPenIcon className="size-4 shrink-0 text-white" />
            Add Subscription
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="min-w-0">
            <ChevronSelect
              value={filters.rating}
              onChange={(e) =>
                onChange({ ...filters, rating: e.target.value as SubscriptionListFilters['rating'] })
              }
              className="!h-10 w-full rounded-lg border-[#e2e8f0] bg-surface px-3 text-sm text-heading"
              aria-label="Filter by rating"
            >
              <option value="all">Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </ChevronSelect>
          </div>
          <div className="min-w-0">
            <ChevronSelect
              value={filters.status}
              onChange={(e) =>
                onChange({ ...filters, status: e.target.value as SubscriptionListFilters['status'] })
              }
              className="!h-10 w-full rounded-lg border-[#e2e8f0] bg-surface px-3 text-sm text-heading"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </ChevronSelect>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="h-10 w-full rounded-lg border border-[#e2e8f0] bg-surface px-4 text-sm font-medium text-heading hover:bg-surface-muted"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
          >
            Apply
          </button>
        </div>

        <Link
          to="/subscriptions/new"
          className={cn(
            'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4',
            'text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95',
            'sm:hidden',
          )}
        >
          <EditPenIcon className="size-4 shrink-0 text-white" />
          Add Subscription
        </Link>
      </div>

      {/* Desktop */}
      <div className="hidden items-center gap-4 lg:flex">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-[18px] shrink-0 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder="Search companies, plans"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="h-10 w-full rounded-lg border-0 bg-[#f1f5f9] pl-11 pr-4 text-sm text-heading placeholder:text-placeholder-alt outline-none focus:ring-2 focus:ring-[#1877f2]/20"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="w-[130px] shrink-0">
            <ChevronSelect
              value={filters.rating}
              onChange={(e) =>
                onChange({ ...filters, rating: e.target.value as SubscriptionListFilters['rating'] })
              }
              className="!h-10 w-full rounded-lg border-[#e2e8f0] bg-surface px-3 text-sm text-heading"
              aria-label="Filter by rating"
            >
              <option value="all">Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </ChevronSelect>
          </div>
          <div className="w-[130px] shrink-0">
            <ChevronSelect
              value={filters.status}
              onChange={(e) =>
                onChange({ ...filters, status: e.target.value as SubscriptionListFilters['status'] })
              }
              className="!h-10 w-full rounded-lg border-[#e2e8f0] bg-surface px-3 text-sm text-heading"
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </ChevronSelect>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="h-10 shrink-0 rounded-lg border border-[#e2e8f0] bg-surface px-5 text-sm font-medium text-heading hover:bg-surface-muted"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onApply}
            className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95"
          >
            Apply
          </button>
          <Link
            to="/subscriptions/new"
            className={cn(
              'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5',
              'text-sm font-semibold text-white shadow-[0_4px_12px_rgba(24,119,242,0.25)] hover:opacity-95',
            )}
          >
            <EditPenIcon className="size-4 shrink-0 text-white" />
            Add Subscription
          </Link>
        </div>
      </div>
    </div>
  )
}
