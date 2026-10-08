import { Link } from 'react-router-dom'
import type { Client } from '@/features/clients/model/types'
import { ClientStatusBadge } from '@/features/clients/ui/ClientStatusBadge'
import { EditIcon, EyeIcon, TrashIcon } from '@/features/clients/ui/icons'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type ClientsTableProps = {
  clients: Client[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
  canWrite?: boolean
  deletingId?: string | null
  isFiltered?: boolean
  showContractValue?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function ClientsTable({
  clients,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  onDelete,
  canWrite = false,
  deletingId = null,
  isFiltered = false,
  showContractValue = false,
}: ClientsTableProps) {
  if (total === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-border-card px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-heading sm:text-2xl">Client Directory</h2>
        </div>
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title={isFiltered ? 'No clients found' : 'No clients yet'}
            description={
              isFiltered
                ? 'Try adjusting your search or filters.'
                : canWrite
                  ? 'Add a client to see them listed here.'
                  : 'No clients are available yet.'
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

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border-card px-4 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-heading sm:text-2xl">Client Directory</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className={cn(
              'rounded-xl border border-border-card bg-surface p-4',
              deletingId === client.id && 'animate-pulse opacity-60',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-heading">{client.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">{client.clientCode}</p>
              </div>
              <ClientStatusBadge status={client.status} />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Active projects</dt>
                <dd className="text-heading">{client.activeProjectCount}</dd>
              </div>
              {showContractValue ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Contract value</dt>
                  <dd className="text-heading">{formatCurrency(client.totalContractValue)}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-3 flex justify-end gap-2">
              {canWrite && (
                <Link
                  to={`/clients/${client.id}/edit`}
                  className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
                  aria-label={`Edit ${client.name}`}
                >
                  <EditIcon />
                </Link>
              )}
              <Link
                to={`/clients/${client.id}`}
                className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
                aria-label={`View ${client.name}`}
              >
                <EyeIcon />
              </Link>
              {canWrite && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(client.id)}
                  disabled={deletingId === client.id}
                  className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] hover:opacity-90 disabled:opacity-50"
                  aria-label={`Delete ${client.name}`}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-card bg-[#f8fafc] text-xs font-semibold uppercase tracking-wide text-text-muted">
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Active projects</th>
              {showContractValue ? <th className="px-6 py-3">Contract value</th> : null}
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className={cn(
                  'border-b border-border-card last:border-0',
                  deletingId === client.id && 'animate-pulse opacity-60',
                )}
              >
                <td className="px-6 py-4 font-medium text-text-muted">{client.clientCode}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-heading">{client.name}</p>
                  {client.email ? (
                    <p className="text-xs text-text-muted">{client.email}</p>
                  ) : null}
                </td>
                <td className="px-6 py-4">
                  <ClientStatusBadge status={client.status} />
                </td>
                <td className="px-6 py-4 text-heading">{client.activeProjectCount}</td>
                {showContractValue ? (
                  <td className="px-6 py-4 text-heading">
                    {formatCurrency(client.totalContractValue)}
                  </td>
                ) : null}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {canWrite && (
                      <Link
                        to={`/clients/${client.id}/edit`}
                        className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
                        aria-label={`Edit ${client.name}`}
                      >
                        <EditIcon />
                      </Link>
                    )}
                    <Link
                      to={`/clients/${client.id}`}
                      className="flex size-9 items-center justify-center rounded-lg bg-[#eff6ff] text-[#1877f2] hover:opacity-90"
                      aria-label={`View ${client.name}`}
                    >
                      <EyeIcon />
                    </Link>
                    {canWrite && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(client.id)}
                        disabled={deletingId === client.id}
                        className="flex size-9 items-center justify-center rounded-lg bg-[#fef2f2] text-[#dc2626] hover:opacity-90 disabled:opacity-50"
                        aria-label={`Delete ${client.name}`}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-border-card px-4 py-4 sm:flex-row sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart}–{rangeEnd} of {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              page <= 1
                ? 'cursor-not-allowed text-text-muted'
                : 'text-heading hover:bg-[#f1f5f9]',
            )}
          >
            Previous
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPageChange(n)}
              className={cn(
                'size-8 rounded-lg text-sm font-semibold',
                n === page
                  ? 'bg-primary text-white'
                  : 'text-heading hover:bg-[#f1f5f9]',
              )}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium',
              page >= totalPages
                ? 'cursor-not-allowed text-text-muted'
                : 'text-heading hover:bg-[#f1f5f9]',
            )}
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
