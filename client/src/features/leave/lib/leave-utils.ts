import type {
  LeaveRequest,
  LeaveRequestStatusFilter,
} from '@/features/leave/model/types'
import {
  formatCompanyDate,
  formatCompanyDateRange,
  formatCompanyMediumDate,
} from '@/shared/lib/format'

export function formatLeaveDate(iso: string): string {
  return formatCompanyMediumDate(iso)
}

export function formatLeaveDateRange(start: string, end: string): string {
  return formatCompanyDateRange(start, end)
}

export function formatAppliedDate(iso: string): string {
  return formatCompanyDate(iso)
}

/** Pending leave whose end date is before today (UTC calendar day). */
export function isLeaveOverdue(request: Pick<LeaveRequest, 'status' | 'endDate' | 'isOverdue'>): boolean {
  if (request.isOverdue != null) return request.isOverdue
  if (request.status !== 'pending') return false
  const end = request.endDate.slice(0, 10)
  const now = new Date()
  const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  return end < today
}

export function filterLeaveRequests(
  items: LeaveRequest[],
  search: string,
  leaveType: string,
  status: LeaveRequestStatusFilter,
  month: string = 'all',
): LeaveRequest[] {
  const q = search.trim().toLowerCase()
  return items.filter((item) => {
    const matchesSearch =
      !q ||
      item.employeeName.toLowerCase().includes(q) ||
      item.requestId.toLowerCase().includes(q) ||
      item.reason.toLowerCase().includes(q) ||
      item.leaveTypeName.toLowerCase().includes(q)

    const matchesType = leaveType === 'all' || item.leaveTypeId === leaveType
    const overdue = isLeaveOverdue(item)
    const matchesStatus =
      status === 'all' ||
      (status === 'overdue' && overdue) ||
      (status === 'pending' && item.status === 'pending' && !overdue) ||
      (status !== 'overdue' && status !== 'pending' && item.status === status)
    const matchesMonth =
      month === 'all' ||
      item.startDate.startsWith(month) ||
      item.appliedDate.startsWith(month)
    return matchesSearch && matchesType && matchesStatus && matchesMonth
  })
}

export function computeLeaveStats(requests: LeaveRequest[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pendingAll = requests.filter((r) => r.status === 'pending')
  const overdue = pendingAll.filter((r) => isLeaveOverdue(r))
  const pending = pendingAll.filter((r) => !isLeaveOverdue(r))

  return {
    total: requests.length,
    pending: pending.length,
    overdue: overdue.length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    currentlyOnLeave: new Set(
      requests
        .filter((r) => {
          if (r.status !== 'approved') return false
          const start = new Date(r.startDate)
          const end = new Date(r.endDate)
          start.setHours(0, 0, 0, 0)
          end.setHours(23, 59, 59, 999)
          return start <= today && end >= today
        })
        .map((r) => r.employeeId),
    ).size,
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}
