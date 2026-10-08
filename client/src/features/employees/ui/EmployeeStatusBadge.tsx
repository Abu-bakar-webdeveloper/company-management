import type { EmployeeStatus } from '@/features/employees/model/types'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<EmployeeStatus, string> = {
  active: 'bg-[#ecfdf5] text-[#00b67a]',
  pending: 'bg-[#eff6ff] text-[#1877f2]',
  on_leave: 'bg-[#fff7ed] text-[#ea580c]',
  inactive: 'bg-[#fef2f2] text-[#dc2626]',
  suspended: 'bg-[#fef2f2] text-[#dc2626]',
}

const statusBadgeLabels: Record<EmployeeStatus, string> = {
  active: 'ACTIVE',
  pending: 'PENDING',
  on_leave: 'ON LEAVE',
  inactive: 'INACTIVE',
  suspended: 'SUSPENDED',
}

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
        statusStyles[status],
      )}
    >
      {statusBadgeLabels[status]}
    </span>
  )
}
