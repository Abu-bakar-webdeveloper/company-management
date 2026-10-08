import type { TaskPriority } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-[#fef2f2] text-[#dc2626]',
  active: 'bg-[#ecfdf5] text-[#00b67a]',
  medium: 'bg-[#eff6ff] text-[#1877f2]',
  low: 'bg-[#f1f5f9] text-[#64748b]',
}

const priorityLabels: Record<TaskPriority, string> = {
  high: 'HIGH',
  active: 'ACTIVE',
  medium: 'MEDIUM',
  low: 'LOW',
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
        priorityStyles[priority],
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}
