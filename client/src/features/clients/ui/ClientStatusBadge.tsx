import { clientStatusLabels } from '@/features/clients/model/schemas'
import type { ClientStatus } from '@/features/clients/model/types'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<ClientStatus, string> = {
  active: 'bg-[#ecfdf5] text-[#059669]',
  inactive: 'bg-[#f1f5f9] text-[#64748b]',
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusStyles[status],
      )}
    >
      {clientStatusLabels[status]}
    </span>
  )
}
