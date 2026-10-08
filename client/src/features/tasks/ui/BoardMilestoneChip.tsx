import type { BoardMilestone } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'

export function BoardMilestoneChip({ milestone }: { milestone: BoardMilestone | null | undefined }) {
  if (!milestone) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold text-heading">
      <span className={cn('size-1.5 rounded-full', milestone.colorClass)} />
      {milestone.name}
    </span>
  )
}
