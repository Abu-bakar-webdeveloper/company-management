import type { TaskStatus } from '@/features/tasks/model/types'
import { cn } from '@/shared/lib/cn'

const statusStyles: Record<TaskStatus, string> = {
  in_progress: 'bg-[#fff7ed] text-[#ea580c]',
  completed: 'bg-[#ecfdf5] text-[#00b67a]',
  hold: 'bg-[#f1f5f9] text-[#64748b]',
  overdue: 'bg-[#fef2f2] text-[#dc2626]',
}

const statusLabels: Record<TaskStatus, string> = {
  in_progress: 'IN PROGRES',
  completed: 'COMPLETED',
  hold: 'HOLD',
  overdue: 'OVERDUE',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
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
