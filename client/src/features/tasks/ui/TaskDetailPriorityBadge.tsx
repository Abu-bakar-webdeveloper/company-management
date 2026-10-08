import type { TaskPriority } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-[#fef2f2] text-[#dc2626]',
  active: 'bg-[#ecfdf5] text-[#00b67a]',
  medium: 'bg-[#fff7ed] text-[#ea580c]',
  low: 'bg-[#f1f5f9] text-[#64748b]',
}

const priorityLabels: Record<TaskPriority, string> = {
  high: 'High Priority',
  active: 'Active',
  medium: 'Medium Priority',
  low: 'Low Priority',
}

export function TaskDetailPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-[11px] font-semibold',
        priorityStyles[priority],
      )}
    >
      {priorityLabels[priority]}
    </span>
  )
}
