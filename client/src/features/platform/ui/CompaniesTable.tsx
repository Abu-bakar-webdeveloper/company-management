import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Company } from '@/features/platform/model/types'
import { CompanyPlanBadge } from '@/features/platform/ui/CompanyPlanBadge'
import { CompanyStatusBadge } from '@/features/platform/ui/CompanyStatusBadge'
import { EditPenIcon, MoreVertIcon } from '@/features/platform/ui/icons'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { DashboardSectionHeader } from '@/features/dashboard/ui/DashboardSectionHeader'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type CompaniesTableProps = {
  companies: Company[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  title?: string
  showViewAll?: boolean
  viewAllTo?: string
  showPagination?: boolean
  onSuspend?: (company: Company) => void
  onReactivate?: (company: Company) => void
  statusActionPendingId?: string | null
  isFiltered?: boolean
}

const ACTION_TRANSITION_MS = 180
const ACTION_PANEL_WIDTH = 160

function getActionItems(variant: Company['actionVariant']) {
  if (variant === 'reactivate') return ['reactivate', 'edit'] as const
  if (variant === 'edit') return ['view', 'edit'] as const
  return ['view', 'suspend', 'edit'] as const
}

const menuItemClass =
  'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors'

function CompanyRowActions({
  company,
  vertical = false,
  onSuspend,
  onReactivate,
  statusActionPending,
}: {
  company: Company
  vertical?: boolean
  onSuspend?: (company: Company) => void
  onReactivate?: (company: Company) => void
  statusActionPending?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const items = getActionItems(company.actionVariant)
  const panelHeight = 12 + items.length * 36 + Math.max(0, items.length - 1) * 4

  const updatePanelPos = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return

    const viewportPadding = 8
    let left = rect.right - ACTION_PANEL_WIDTH
    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - ACTION_PANEL_WIDTH - viewportPadding),
    )

    let top = rect.bottom + 6
    if (top + panelHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, rect.top - panelHeight - 6)
    }

    setPanelPos({ top, left })
  }

  const openPanel = () => {
    updatePanelPos()
    setIsOpen(true)
  }

  const closePanel = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleReposition = () => updatePanelPos()
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [isOpen])

  const actionsPanelStyle: CSSProperties = {
    position: 'fixed',
    top: panelPos.top,
    left: panelPos.left,
    width: ACTION_PANEL_WIDTH,
    transitionProperty: 'opacity, transform',
    transitionDuration: `${ACTION_TRANSITION_MS}ms`,
    transitionTimingFunction: 'ease-out',
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.96)',
    transformOrigin: 'top right',
    pointerEvents: isOpen ? 'auto' : 'none',
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative flex h-8 w-8 items-center justify-center', !vertical && 'mx-auto')}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? closePanel() : openPanel())}
        className={cn(
          'flex size-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-muted',
          isOpen && 'bg-surface-muted text-heading',
        )}
        aria-label={`More actions for ${company.name}`}
        aria-expanded={isOpen}
      >
        <MoreVertIcon />
      </button>

      <div
        style={actionsPanelStyle}
        className="z-50 flex flex-col gap-1 rounded-xl border border-border-card bg-surface p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
        role="menu"
      >
        {items.map((item) => {
          if (item === 'view') {
            return (
              <Link
                key={item}
                to={`/companies/${company.id}`}
                role="menuitem"
                onClick={closePanel}
                className={cn(menuItemClass, 'bg-primary text-white hover:opacity-95')}
              >
                View
              </Link>
            )
          }

          if (item === 'edit') {
            return (
              <Link
                key={item}
                to={`/companies/${company.id}/edit`}
                role="menuitem"
                onClick={closePanel}
                className={cn(
                  menuItemClass,
                  'border border-border bg-surface text-heading hover:bg-surface-muted',
                )}
              >
                <EditPenIcon className="size-3.5 shrink-0" />
                Edit
              </Link>
            )
          }

          if (item === 'reactivate') {
            return (
              <button
                key={item}
                type="button"
                role="menuitem"
                disabled={statusActionPending}
                onClick={() => {
                  onReactivate?.(company)
                  closePanel()
                }}
                className={cn(
                  menuItemClass,
                  'bg-[#00b67a] text-white hover:opacity-95 disabled:opacity-70',
                )}
              >
                {statusActionPending ? '…' : 'Reactivate'}
              </button>
            )
          }

          return (
            <button
              key={item}
              type="button"
              role="menuitem"
              disabled={statusActionPending}
              onClick={() => {
                onSuspend?.(company)
                closePanel()
              }}
              className={cn(
                menuItemClass,
                'bg-[#fef2f2] text-danger hover:bg-[#fee2e2] disabled:opacity-70',
              )}
            >
              {statusActionPending ? '…' : 'Suspend'}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CompaniesTable({
  companies,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  title = 'Recently Added Companies',
  showViewAll = true,
  viewAllTo,
  showPagination = true,
  onSuspend,
  onReactivate,
  statusActionPendingId = null,
  isFiltered = false,
}: CompaniesTableProps) {
  const header = showViewAll ? (
    <DashboardSectionHeader title={title} to={viewAllTo} />
  ) : null

  if (total === 0) {
    return (
      <Card className="overflow-hidden">
        {header}
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No companies found' : 'No companies yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : 'Add companies to see them listed here.'
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
        {companies.map((company) => (
          <div
            key={`${company.id}-${company.plan}`}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-heading">{company.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CompanyPlanBadge plan={company.plan} />
                  <CompanyStatusBadge status={company.status} />
                </div>
              </div>
              <CompanyRowActions
                company={company}
                vertical
                onSuspend={onSuspend}
                onReactivate={onReactivate}
                statusActionPending={statusActionPendingId === company.id}
              />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border-card pt-3">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">Users</dt>
                <dd className="mt-1 text-sm font-medium text-heading">{company.users}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                  User Limit
                </dt>
                <dd className="mt-1 text-sm font-medium text-heading">{company.userLimit}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase leading-4 tracking-wide text-heading">
              <th className="px-4 py-3.5">Company</th>
              <th className="px-4 py-3.5">Plan</th>
              <th className="px-4 py-3.5">Users</th>
              <th className="px-4 py-3.5">User Limit</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={`${company.id}-${company.plan}`} className="border-t border-border-card">
                <td className="truncate px-4 py-4 font-medium text-heading">{company.name}</td>
                <td className="px-4 py-4">
                  <CompanyPlanBadge plan={company.plan} />
                </td>
                <td className="px-4 py-4 text-text-muted">{company.users}</td>
                <td className="px-4 py-4 text-text-muted">{company.userLimit}</td>
                <td className="px-4 py-4">
                  <CompanyStatusBadge status={company.status} />
                </td>
                <td className="relative px-4 py-4 text-center">
                  <CompanyRowActions
                    company={company}
                    onSuspend={onSuspend}
                    onReactivate={onReactivate}
                    statusActionPending={statusActionPendingId === company.id}
                  />
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
