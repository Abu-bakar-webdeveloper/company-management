import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Subscription } from '@/features/platform/model/types'
import { CompanyPlanBadge } from '@/features/platform/ui/CompanyPlanBadge'
import { CompanyStatusBadge } from '@/features/platform/ui/CompanyStatusBadge'
import { EditPenIcon, MoreVertIcon } from '@/features/platform/ui/icons'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { DashboardSectionHeader } from '@/features/dashboard/ui/DashboardSectionHeader'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type SubscriptionsTableProps = {
  subscriptions: Subscription[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  showViewAll?: boolean
  showPagination?: boolean
  title?: string
  isFiltered?: boolean
}

const ACTION_TRANSITION_MS = 500
const ACTION_STAGGER_MS = 80

function getActionButtonCount(variant: Subscription['actionVariant']) {
  return variant === 'edit' ? 2 : 3
}

function getActionButtonStyle(buttonIndex: number, buttonCount: number, isOpen: boolean): CSSProperties {
  const openDelay = 100 + buttonIndex * ACTION_STAGGER_MS
  const closeDelay = (buttonCount - 1 - buttonIndex) * ACTION_STAGGER_MS

  return {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: isOpen ? `${openDelay}ms` : `${closeDelay}ms`,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.95)',
    pointerEvents: isOpen ? 'auto' : 'none',
  }
}

function SubscriptionRowActions({
  subscription,
  vertical = false,
}: {
  subscription: Subscription
  vertical?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonCount = getActionButtonCount(subscription.actionVariant)
  const dotCloseDelay = (buttonCount - 1) * ACTION_STAGGER_MS + 180

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const dotButtonStyle: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: isOpen ? '0ms' : `${dotCloseDelay}ms`,
    opacity: isOpen ? 0 : 1,
    transform: isOpen ? 'scale(0.75)' : 'scale(1)',
    pointerEvents: isOpen ? 'none' : 'auto',
  }

  const actionsPanelStyle: CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-in-out',
    transitionDelay: isOpen ? '60ms' : `${(buttonCount - 1) * ACTION_STAGGER_MS + 40}ms`,
    opacity: isOpen ? 1 : 0,
    transform: vertical
      ? isOpen
        ? 'scale(1)'
        : 'scale(0.95)'
      : isOpen
        ? 'translate(-50%, -50%) scale(1)'
        : 'translate(-50%, -50%) scale(0.95)',
    transformOrigin: vertical ? 'top right' : 'center',
    pointerEvents: isOpen ? 'auto' : 'none',
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative flex h-8 w-8 items-center justify-center', !vertical && 'mx-auto')}
    >
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={dotButtonStyle}
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface-muted',
          isOpen && 'absolute',
        )}
        aria-label={`More actions for ${subscription.companyName}`}
        aria-expanded={isOpen}
      >
        <MoreVertIcon />
      </button>

      <div
        style={actionsPanelStyle}
        className={cn(
          'absolute z-20 whitespace-nowrap',
          vertical
            ? 'right-0 top-0 flex w-36 flex-col items-stretch gap-1.5 rounded-xl p-1.5 '
            : 'left-1/2 top-1/2 flex items-center gap-1.5 rounded-lg px-1',
        )}
      >
        <Link
          to={`/subscriptions/${subscription.id}`}
          style={getActionButtonStyle(0, buttonCount, isOpen)}
          className={cn(
            'rounded-lg bg-primary px-3 py-1.5 text-center text-xs font-medium text-white hover:opacity-95 xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
            vertical && 'w-full shadow-none!',
          )}
        >
          View
        </Link>

        {subscription.actionVariant === 'reactivate' && (
          <button
            type="button"
            style={getActionButtonStyle(1, buttonCount, isOpen)}
            className={cn(
            'rounded-lg bg-[#00b67a] px-3 py-1.5 text-xs font-semibold tracking-wide text-white hover:opacity-95 xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
            vertical && 'w-full shadow-none!',
            )}
          >
            REACTIVATE
          </button>
        )}

        {subscription.actionVariant === 'view' && (
          <button
            type="button"
            style={getActionButtonStyle(1, buttonCount, isOpen)}
            className={cn(
            'rounded-lg bg-[#fef2f2] px-3 py-1.5 text-xs font-medium text-danger hover:opacity-95 xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
            vertical && 'w-full shadow-none!',
            )}
          >
            Suspend
          </button>
        )}

        <Link
          to={`/subscriptions/${subscription.id}/edit`}
          style={getActionButtonStyle(subscription.actionVariant === 'edit' ? 1 : 2, buttonCount, isOpen)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-heading hover:bg-surface-muted xl:px-4 shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
            vertical && 'w-full justify-center shadow-none!',
          )}
        >
          <EditPenIcon className="size-3.5" />
          Edit
        </Link>
      </div>
    </div>
  )
}

export function SubscriptionsTable({
  subscriptions,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  showViewAll = true,
  showPagination = true,
  title = 'Recently Added Companies',
  isFiltered = false,
}: SubscriptionsTableProps) {
  const header = showViewAll ? <DashboardSectionHeader title={title} /> : null

  if (total === 0) {
    return (
      <Card className="overflow-hidden">
        {header}
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No subscriptions found' : 'No subscriptions yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Subscriptions will appear here once companies are enrolled.'
            }
            minHeight="min-h-[280px]"
          />
        </div>
      </Card>
    )
  }

  const pageNumbers =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1]

  const paginationBar = showPagination ? (
    <div className="flex flex-col gap-3 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <p className="text-center text-xs text-text-muted sm:text-left sm:text-sm">
        Showing {rangeStart} to {rangeEnd} of {total} results
      </p>
      <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-0.5 sm:gap-2 sm:pb-0">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          <span className="sm:hidden">Prev</span>
          <span className="hidden sm:inline">Previous</span>
        </button>
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={cn(
              'min-w-8 shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium sm:min-w-9 sm:px-3 sm:text-sm',
              pageNum === page
                ? 'bg-primary text-white hover:opacity-95'
                : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
            )}
          >
            {pageNum}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
        >
          <span className="sm:hidden">Next</span>
          <span className="hidden sm:inline">Next</span>
        </button>
      </div>
    </div>
  ) : null

  return (
    <Card className="overflow-hidden">
      {header}

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">{sub.companyName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CompanyPlanBadge plan={sub.plan} />
                  <CompanyStatusBadge status={sub.status} />
                </div>
              </div>
              <SubscriptionRowActions subscription={sub} vertical />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border-card pt-3 text-xs">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Users</p>
                <p className="mt-1 text-sm font-medium text-heading">{sub.users}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Admin Limit</p>
                <p className="mt-1 text-sm font-medium text-heading">{sub.adminLimit}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Expiry</p>
                <p className="mt-1 text-sm font-medium text-heading">{sub.expiryDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase leading-4 tracking-wide text-heading">
              <th className="px-4 py-3.5">Company</th>
              <th className="px-4 py-3.5">Plan</th>
              <th className="px-4 py-3.5">Users</th>
              <th className="px-4 py-3.5">Admin Limit</th>
              <th className="px-4 py-3.5">Expiry Date</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-t border-border-card">
                <td className="truncate px-4 py-4 font-medium text-heading">{sub.companyName}</td>
                <td className="px-4 py-4">
                  <CompanyPlanBadge plan={sub.plan} />
                </td>
                <td className="px-4 py-4 text-text-muted">{sub.users}</td>
                <td className="px-4 py-4 text-text-muted">{sub.adminLimit}</td>
                <td className="truncate px-4 py-4 text-text-muted">{sub.expiryDate}</td>
                <td className="px-4 py-4">
                  <CompanyStatusBadge status={sub.status} />
                </td>
                <td className="relative px-4 py-4 text-center">
                  <SubscriptionRowActions subscription={sub} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {paginationBar}
    </Card>
  )
}
