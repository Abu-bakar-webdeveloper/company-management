import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useLeaveRequests } from '@/features/leave/hooks/useLeave'
import { mapLeaveRequestToHrRow } from '@/features/leave/lib/leave-mappers'
import type { HrLeaveRow } from '@/features/dashboard/hr/model/hrDashboardData'
import { EmployeeLeaveTypeBadge } from '@/features/dashboard/employee/ui/EmployeeLeaveTypeBadge'
import { EyeIcon } from '@/features/dashboard/employee/ui/employeeIcons'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { cn } from '@/shared/lib/cn'

const statusStyles = {
  pending: 'bg-[#FFF7ED] text-[#EA580C]',
  approved: 'bg-[#ECFDF5] text-[#00B67A]',
  rejected: 'bg-[#FEF2F2] text-[#DC2626]',
}

const statusLabels = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
}

type HrLeaveRequestsTableProps = {
  requests?: HrLeaveRow[]
}

export function HrLeaveRequestsTable({ requests: requestsProp }: HrLeaveRequestsTableProps) {
  const { data: fetched = [], isLoading } = useLeaveRequests(
    { scope: 'company', limit: 5 },
    { enabled: !requestsProp },
  )
  const requests = requestsProp ?? fetched.slice(0, 5).map(mapLeaveRequestToHrRow)
  const isFetching = isLoading && !requestsProp
  const hasData = requests.length > 0

  return (
    <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">
          Recent Leave Requests
        </h3>
        {!isFetching && hasData ? (
          <Link
            to="/leave"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-primary bg-surface px-5 text-sm font-semibold text-primary hover:bg-[#eff6ff]"
          >
            View All
          </Link>
        ) : null}
      </div>

      {isFetching ? (
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <p className="text-sm text-text-muted">Loading leave requests…</p>
        </div>
      ) : !hasData ? (
        <div className="px-5 pb-5 sm:px-6">
          <ComingSoonState
            title="No leave requests yet"
            description="Leave requests will show up here once employees submit them."
            minHeight="min-h-[220px]"
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-[#1E293B]">
                <th className="px-5 py-3.5 sm:px-6">Employee</th>
                <th className="px-5 py-3.5 sm:px-6">Leave Type</th>
                <th className="px-5 py-3.5 sm:px-6">Dates</th>
                <th className="px-5 py-3.5 sm:px-6">Status</th>
                <th className="px-5 py-3.5 sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((row) => (
                <tr key={row.id} className="border-t border-[#E2E8F0]">
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={row.employee} avatar={row.avatar} size="md" />
                      <span className="font-medium text-[#1E293B]">{row.employee}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <EmployeeLeaveTypeBadge icon={row.icon} />
                      <span className="font-medium text-[#1E293B]">{row.leaveType}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#64748B] sm:px-6">{row.dates}</td>
                  <td className="px-5 py-4 sm:px-6">
                    <span
                      className={cn(
                        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
                        statusStyles[row.status],
                      )}
                    >
                      {statusLabels[row.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 sm:px-6">
                    <Link
                      to={`/leave/requests/${row.id}`}
                      aria-label="View request"
                      className="inline-flex size-8 items-center justify-center rounded-lg text-primary hover:opacity-70"
                    >
                      <EyeIcon />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
