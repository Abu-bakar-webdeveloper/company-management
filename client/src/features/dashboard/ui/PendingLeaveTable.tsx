import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useLeaveRequests } from '@/features/leave/hooks/useLeave'
import { mapLeaveRequestToPendingRow } from '@/features/leave/lib/leave-mappers'
import { Card } from '@/shared/ui/Card'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

export type PendingLeaveRow = {
  id: string
  employee: string
  avatar?: string
  reason: string
  duration: string
  status: 'pending' | 'approved' | 'rejected'
}

type PendingLeaveTableProps = {
  title?: string
  requests?: PendingLeaveRow[]
}

export function PendingLeaveTable({
  title = 'Pending Leave Requests',
  requests: requestsProp,
}: PendingLeaveTableProps) {
  const { data: fetched = [], isLoading } = useLeaveRequests(
    { scope: 'team', status: 'pending', limit: 5 },
    { enabled: !requestsProp },
  )
  const requests = requestsProp ?? fetched.slice(0, 5).map(mapLeaveRequestToPendingRow)
  const isFetching = isLoading && !requestsProp
  const hasData = requests.length > 0

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-6 py-6">
        <h3 className="text-[24px] font-semibold leading-6 text-heading">{title}</h3>
        {!isFetching && hasData ? (
          <Link to="/leave" className="text-sm font-bold text-primary hover:opacity-90">
            View All
          </Link>
        ) : null}
      </div>

      {isFetching ? (
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <p className="text-sm text-text-muted">Loading pending requests…</p>
        </div>
      ) : !hasData ? (
        <div className="px-6 pb-6">
          <ComingSoonState
            title="No pending leave yet"
            description="Pending leave requests will show up here for review."
            minHeight="min-h-[220px]"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="bg-table-header text-base font-semibold uppercase tracking-wide text-heading">
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Action</th>
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
                  <td className="px-6 py-4 text-text-muted">{row.reason}</td>
                  <td className="px-6 py-4 text-text-muted">{row.duration}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
                        row.status === 'pending'
                          ? 'bg-warning-muted text-warning'
                          : 'bg-success-muted text-success',
                      )}
                    >
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/leave/requests/${row.id}`}
                      className="rounded-lg bg-primary px-4 py-1.5 text-xs font-medium text-white hover:opacity-95"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
