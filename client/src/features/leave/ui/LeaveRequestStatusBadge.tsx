import type { LeaveRequestStatus } from '@/features/leave/model/types'
import { requestStatusLabels } from '@/features/leave/model/leaveData'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<LeaveRequestStatus, string> = {
  pending: 'bg-[#fff7ed] text-[#ea580c]',
  approved: 'bg-[#ecfdf5] text-[#00b67a]',
  rejected: 'bg-[#fef2f2] text-[#dc2626]',
}

const overdueStyle = 'bg-[#fef2f2] text-[#b91c1c]'

type LeaveRequestStatusBadgeProps = {
  status: LeaveRequestStatus
  isOverdue?: boolean
}

export function LeaveRequestStatusBadge({ status, isOverdue }: LeaveRequestStatusBadgeProps) {
  if (status === 'pending' && isOverdue) {
    return (
      <span
        className={cn(
          'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
          overdueStyle,
        )}
      >
        OVERDUE
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
        statusStyles[status],
      )}
    >
      {requestStatusLabels[status]}
    </span>
  )
}
