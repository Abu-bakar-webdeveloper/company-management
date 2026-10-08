import { statusLabels } from '@/features/salaries/model/salariesData'
import type { SalaryStatus } from '@/features/salaries/model/types'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<SalaryStatus, string> = {
  paid: 'bg-[#ecfdf5] text-[#16a34a]',
  pending: 'bg-[#fff7ed] text-[#ea580c]',
  on_hold: 'bg-[#fef2f2] text-[#dc2626]',
}

export function SalaryStatusBadge({ status }: { status: SalaryStatus }) {
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
