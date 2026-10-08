import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { LeaveTableSkeleton } from '@/features/dashboard/ui/DashboardSkeletons'
import { useLeaveRequests } from '@/features/leave/hooks/useLeave'
import { mapLeaveRequestToHrRow } from '@/features/leave/lib/leave-mappers'
import type { HrLeaveRow } from '@/features/dashboard/hr/model/hrDashboardData'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

const statusStyles = {
  pending: 'bg-[#fff7ed] text-[#ea580c]',
  approved: 'bg-[#ecfdf5] text-[#00b67a]',
  rejected: 'bg-[#fef2f2] text-[#dc2626]',
}

const statusLabels = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
}

type RecentLeaveTableProps = {
  title?: string
  requests?: HrLeaveRow[]
}

function StatusBadge({ status, id }: { status: HrLeaveRow['status']; id: string }) {
  return (
    <Link
      to={`/leave/requests/${id}`}
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide hover:opacity-90',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </Link>
  )
}

export function RecentLeaveTable({
  title = 'Recent Leave Requests',
  requests: requestsProp,
}: RecentLeaveTableProps) {
  const { data: fetched = [], isLoading } = useLeaveRequests(
    { scope: 'company', limit: 5 },
    { enabled: !requestsProp },
  )
  const requests = requestsProp ?? fetched.slice(0, 5).map(mapLeaveRequestToHrRow)
  const isFetching = isLoading && !requestsProp
  const hasData = requests.length > 0

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-xl leading-6 font-semibold text-heading sm:text-[24px]">{title}</h3>
        {!isFetching && hasData ? (
          <Link to="/leave" className="text-sm font-bold text-[#1877f2] hover:opacity-90">
            View All
          </Link>
        ) : null}
      </div>

      {isFetching ? (
        <LeaveTableSkeleton />
      ) : !hasData ? (
        <div className="px-4 pb-5 sm:px-6">
          <ComingSoonState
            title="No leave requests yet"
            description="Leave requests will show up here once employees submit them."
            minHeight="min-h-[220px]"
          />
        </div>
      ) : (
        <>
          <div className="divide-y divide-border-card lg:hidden">
            {requests.map((row) => (
              <div key={row.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar name={row.employee} avatar={row.avatar} size="sm" />
                    <span className="truncate font-medium text-heading">{row.employee}</span>
                  </div>
                  <StatusBadge status={row.status} id={row.id} />
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Leave Type</dt>
                    <dd className="font-medium text-heading">{row.leaveType}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Dates</dt>
                    <dd className="text-right text-heading">{row.dates}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-table-header text-[16px] leading-4 font-semibold uppercase tracking-wide text-heading">
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Leave Type</th>
                  <th className="px-6 py-3.5">Dates</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((row) => (
                  <tr key={row.id} className="border-t border-border-card">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={row.employee} avatar={row.avatar} size="sm" />
                        <span className="font-medium text-heading">{row.employee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{row.leaveType}</td>
                    <td className="px-6 py-4 text-text-muted">{row.dates}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} id={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}
