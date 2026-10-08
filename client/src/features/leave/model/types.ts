export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected'

/** Status filter values including overdue (pending past end date). */
export type LeaveRequestStatusFilter = LeaveRequestStatus | 'overdue' | 'all'

export type LeaveTypeStatus = 'active' | 'inactive'

export type LeaveTypeIcon = 'sick' | 'casual' | 'annual' | 'unpaid'

export type LeaveManagementTab = 'requests' | 'types'

export type LeaveType = {
  id: string
  name: string
  maxDays: number | 'unlimited'
  description: string
  icon: LeaveTypeIcon
  carryForward: boolean
  paidLeave: boolean
  status: LeaveTypeStatus
}

export type ExcessDisposition = 'none' | 'unpaid_deduct' | 'waived' | 'rejected_excess'

export type LeaveRequest = {
  id: string
  requestId: string
  employeeId: string
  employeeName: string
  department: string
  avatar?: string
  leaveTypeId: string
  leaveTypeName: string
  reason: string
  startDate: string
  endDate: string
  durationDays: number
  balanceDaysUsed?: number
  excessDays?: number
  excessDisposition?: ExcessDisposition
  status: LeaveRequestStatus
  /** Pending with end date before today — still approvable, not in “needs decision” lists. */
  isOverdue?: boolean
  appliedDate: string
  adminComment?: string
  totalLeavesTaken?: number
  remainingBalance?: number
  excessLeaveMode?: 'reject' | 'deduct_from_salary' | 'admin_can_waive'
}

export type LeaveRequestFilters = {
  search: string
  leaveType: string
  status: LeaveRequestStatusFilter
  month: string
}

export type LeaveStats = {
  total: number
  pending: number
  overdue: number
  approved: number
  rejected: number
  currentlyOnLeave: number
}

export type LeaveTypePayload = Omit<LeaveType, 'id'>
