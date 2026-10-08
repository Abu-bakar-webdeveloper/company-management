import { formatLeaveDateRange } from '@/features/leave/lib/leave-utils'
import type { LeaveRequest, LeaveTypeIcon } from '@/features/leave/model/types'
import type { EmployeeLeaveRow } from '@/features/dashboard/employee/model/employeeDashboardData'
import type { HrLeaveRow } from '@/features/dashboard/hr/model/hrDashboardData'
import type { PendingLeaveRow } from '@/features/dashboard/ui/PendingLeaveTable'

function inferIcon(name: string): LeaveTypeIcon {
  const lower = name.toLowerCase()
  if (lower.includes('sick')) return 'sick'
  if (lower.includes('casual')) return 'casual'
  if (lower.includes('annual')) return 'annual'
  if (lower.includes('unpaid')) return 'unpaid'
  return 'casual'
}

export function mapLeaveRequestToEmployeeRow(request: LeaveRequest): EmployeeLeaveRow {
  return {
    id: request.id,
    leaveType: request.leaveTypeName,
    icon: inferIcon(request.leaveTypeName),
    dates: formatLeaveDateRange(request.startDate, request.endDate),
    status: request.status,
  }
}

export function mapLeaveRequestToHrRow(request: LeaveRequest): HrLeaveRow {
  return {
    id: request.id,
    employee: request.employeeName,
    avatar: request.avatar,
    leaveType: request.leaveTypeName,
    icon: inferIcon(request.leaveTypeName),
    dates: formatLeaveDateRange(request.startDate, request.endDate),
    status: request.status,
  }
}

export function mapLeaveRequestToPendingRow(request: LeaveRequest): PendingLeaveRow {
  return {
    id: request.id,
    employee: request.employeeName,
    avatar: request.avatar,
    reason: request.reason,
    duration: formatLeaveDateRange(request.startDate, request.endDate),
    status: request.status,
  }
}
