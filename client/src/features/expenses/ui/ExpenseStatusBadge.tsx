import { statusLabels } from '@/features/expenses/model/expensesData'
import type { ExpenseStatus } from '@/features/expenses/model/types'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<ExpenseStatus, string> = {
  pending: 'bg-[#fff7ed] text-[#ea580c]',
  approved: 'bg-[#ecfdf5] text-[#16a34a]',
  rejected: 'bg-[#fef2f2] text-[#dc2626]',
}

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
