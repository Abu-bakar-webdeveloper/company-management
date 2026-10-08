import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import {
  formatLeaveDateRange,
  isLeaveOverdue,
  truncateText,
} from '@/features/leave/lib/leave-utils'
import type { LeaveRequest } from '@/features/leave/model/types'
import { AvatarCircle } from '@/features/leave/ui/icons'
import { LeaveRequestStatusBadge } from '@/features/leave/ui/LeaveRequestStatusBadge'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type LeaveRequestsTableProps = {
  requests: LeaveRequest[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
  isFiltered?: boolean
}

export function LeaveRequestsTable({
  requests,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  isFiltered = false,
}: LeaveRequestsTableProps) {
  if (total === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <ComingSoonState
          title={isFiltered ? 'No leave requests found' : 'No leave requests yet'}
          description={
            isFiltered
              ? 'Try adjusting your search or filters.'
              : 'Submit a leave request to see it listed here.'
          }
          minHeight="min-h-[280px]"
        />
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
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="rounded-xl border border-border-card bg-surface p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AvatarCircle name={request.employeeName} avatar={request.avatar} />
                <div className="min-w-0">
                  <p className="font-semibold text-heading">{request.employeeName}</p>
                  <p className="text-xs text-text-muted">{request.department}</p>
                </div>
              </div>
              <LeaveRequestStatusBadge
                status={request.status}
                isOverdue={isLeaveOverdue(request)}
              />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Type</dt>
                <dd className="font-medium text-heading">{request.leaveTypeName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Dates</dt>
                <dd className="text-right text-heading">
                  {formatLeaveDateRange(request.startDate, request.endDate)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-muted">Duration</dt>
                <dd className="font-medium text-heading">{request.durationDays} Days</dd>
              </div>
              <div>
                <dt className="text-text-muted">Reason</dt>
                <dd className="mt-1 text-text-muted">{truncateText(request.reason, 80)}</dd>
              </div>
            </dl>
            <Link
              to={`/leave/requests/${request.id}`}
              className={cn(
                'mt-3 inline-block text-sm font-semibold hover:underline',
                request.status === 'pending' ? 'text-danger' : 'text-primary',
              )}
            >
              {request.status === 'pending' ? 'Review' : 'View Details'}
            </Link>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="bg-table-header text-[11px] font-semibold uppercase tracking-wide text-heading">
              <th className="px-6 py-3.5">Employee</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Reason</th>
              <th className="px-6 py-3.5">Dates</th>
              <th className="px-6 py-3.5">Duration</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-t border-border-card">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <AvatarCircle name={request.employeeName} avatar={request.avatar} />
                    <div>
                      <p className="font-semibold text-heading">{request.employeeName}</p>
                      <p className="text-xs text-text-muted">{request.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-heading">{request.leaveTypeName}</td>
                <td className="max-w-[200px] px-6 py-4 text-text-muted">
                  {truncateText(request.reason, 40)}
                </td>
                <td className="px-6 py-4 text-heading">
                  {formatLeaveDateRange(request.startDate, request.endDate)}
                </td>
                <td className="px-6 py-4 text-heading">{request.durationDays} Days</td>
                <td className="px-6 py-4">
                  <LeaveRequestStatusBadge
                    status={request.status}
                    isOverdue={isLeaveOverdue(request)}
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/leave/requests/${request.id}`}
                    className={cn(
                      'text-sm font-semibold hover:underline',
                      request.status === 'pending' ? 'text-danger' : 'text-primary',
                    )}
                  >
                    {request.status === 'pending' ? 'Review' : 'View Details'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-text-muted">
          Showing {rangeStart} to {rangeEnd} of {total} results
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
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
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  )
}
