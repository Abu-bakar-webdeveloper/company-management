import { statusLabel } from '@/features/performance/lib/performance-utils'
import type { PerformanceStatus } from '@/features/performance/model/types'
import { cn } from '@/shared/lib/cn'

const styles: Record<PerformanceStatus, string> = {
  excellent: 'bg-[#ECFDF5] text-[#00B67A]',
  good: 'bg-[#EFF6FF] text-[#1877F2]',
  average: 'bg-[#FFF7ED] text-[#FF9F43]',
  critical: 'bg-[#FEF2F2] text-[#DC2626]',
  needs_improvement: 'bg-[#FFF7ED] text-[#FF9F43]',
  poor: 'bg-[#FEF2F2] text-[#DC2626]',
}

export function PerformanceStatusBadge({ status }: { status: PerformanceStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
        styles[status],
      )}
    >
      {statusLabel(status)}
    </span>
  )
}
