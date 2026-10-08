import type { PunchLocationStatus } from '@/features/attendance/model/types'
import { cn } from '@/shared/lib/cn'

const STYLES: Record<PunchLocationStatus, string> = {
  on_site: 'bg-[#ECFDF5] text-[#00B67A]',
  remote: 'bg-[#FFF7ED] text-[#EA580C]',
  unknown: 'bg-[#F1F5F9] text-[#64748B]',
}

const LABELS: Record<PunchLocationStatus, string> = {
  on_site: 'On site',
  remote: 'Remote',
  unknown: 'Unknown',
}

export function LocationStatusBadge({ status }: { status: PunchLocationStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  )
}
