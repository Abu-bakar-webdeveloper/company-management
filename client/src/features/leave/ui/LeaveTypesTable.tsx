import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { LeaveType } from '@/features/leave/model/types'
import { EditIcon, LeaveTypeIconBadge, TrashIcon } from '@/features/leave/ui/icons'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type LeaveTypesTableProps = {
  types: LeaveType[]
  page: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onDelete: (id: string) => void
  isFiltered?: boolean
}

function LeaveTypeActions({ type, onDelete }: { type: LeaveType; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        to={`/leave/types/${type.id}/edit`}
        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-primary hover:opacity-90"
        aria-label={`Edit ${type.name}`}
      >
        <EditIcon />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(type.id)}
        className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-danger hover:opacity-90"
        aria-label={`Delete ${type.name}`}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

function MaxDaysBadge({ maxDays }: { maxDays: LeaveType['maxDays'] }) {
  return (
    <span className="inline-block rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-semibold text-primary">
      {maxDays === 'unlimited' ? 'Unlimited' : `${maxDays} Days`}
    </span>
  )
}

export function LeaveTypesTable({
  types,
  page,
  total,
  totalPages,
  onPageChange,
  onDelete,
  isFiltered = false,
}: LeaveTypesTableProps) {
  if (total === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No leave types found' : 'No leave types yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : 'Add a leave type to get started.'
          }
          minHeight="min-h-[280px]"
        />
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {types.map((type) => (
          <div
            key={type.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <LeaveTypeIconBadge icon={type.icon} />
                <div className="min-w-0">
                  <p className="font-semibold text-heading">{type.name}</p>
                  <div className="mt-1.5">
                    <MaxDaysBadge maxDays={type.maxDays} />
                  </div>
                </div>
              </div>
              <LeaveTypeActions type={type} onDelete={onDelete} />
            </div>
            {type.description ? (
              <p className="mt-3 text-sm leading-relaxed text-text-muted">{type.description}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-table-header text-[11px] font-semibold uppercase tracking-wide text-heading">
              <th className="px-6 py-3.5">Leave Type</th>
              <th className="px-6 py-3.5">Max Days</th>
              <th className="px-6 py-3.5">Description</th>
              <th className="px-6 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id} className="border-t border-border-card">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <LeaveTypeIconBadge icon={type.icon} />
                    <span className="font-semibold text-heading">{type.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <MaxDaysBadge maxDays={type.maxDays} />
                </td>
                <td className="px-6 py-4 text-text-muted">{type.description}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <LeaveTypeActions type={type} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {total} Leave type{total !== 1 ? 's' : ''}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                pageNum === page
                  ? 'bg-primary text-white hover:opacity-95'
                  : 'border border-border bg-surface text-heading hover:bg-surface-muted',
              )}
            >
              {pageNum}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-heading disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
