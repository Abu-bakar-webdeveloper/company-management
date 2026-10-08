import type { BoardTaskPriority } from '@/features/tasks/model/types'
import { FlagIcon } from '@/features/tasks/ui/boardIcons'
import { cn } from '@/shared/lib/cn'

const styles: Record<BoardTaskPriority, string> = {
  urgent: 'bg-[#fef2f2] text-danger',
  high: 'bg-[#FFF7ED] text-[#c2410c]',
  medium: 'bg-primary-muted text-primary',
  low: 'bg-surface-muted text-text-muted',
}

const labels: Record<BoardTaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const borderColors: Record<BoardTaskPriority, string> = {
  urgent: 'border-l-danger',
  high: 'border-l-[#c2410c]',
  medium: 'border-l-primary',
  low: 'border-l-text-muted',
}

export function boardPriorityBorderClass(priority: BoardTaskPriority) {
  return borderColors[priority]
}

export function BoardPriorityFlag({ priority }: { priority: BoardTaskPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
        styles[priority],
      )}
    >
      <FlagIcon />
      {labels[priority]}
    </span>
  )
}
