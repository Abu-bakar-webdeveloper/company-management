import type { CompanyStatus } from '@/features/platform/model/types'
import { statusLabels } from '@/features/platform/model/companiesData'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<CompanyStatus, string> = {
  trial: 'bg-[#fff7ed] text-[#ea580c]',
  active: 'bg-[#ecfdf5] text-[#00b67a]',
  inactive: 'bg-[#f1f5f9] text-[#64748b]',
}

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  )
}
