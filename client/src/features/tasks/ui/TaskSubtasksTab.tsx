import type { SubtaskStatus, TaskDetail } from '@/features/tasks/model/types'
import { CalendarIcon, ClockIcon } from '@/features/tasks/ui/taskDetailIcons'
import { formatCompanyShortDate } from '@/shared/lib/format'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

const subtaskStatusStyles: Record<SubtaskStatus, string> = {
  pending: 'bg-[#fff7ed] text-[#ea580c]',
  in_progress: 'bg-[#eff6ff] text-[#1877f2]',
  completed: 'bg-[#ecfdf5] text-[#00b67a]',
}

const subtaskStatusLabels: Record<SubtaskStatus, string> = {
  pending: 'PENDING',
  in_progress: 'IN PROGRESS',
  completed: 'COMPLETED',
}

export function TaskSubtasksTab({ task }: { task: TaskDetail }) {
  return (
    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      {task.subtasks.map((subtask) => (
        <Card key={subtask.id} className="flex items-start justify-between gap-3 px-5 py-5">
          <div className="min-w-0">
            <h4 className="font-bold text-heading">{subtask.title}</h4>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
              {subtask.dueDate ? (
                <>
                  <CalendarIcon className="size-3.5" />
                  Due: {formatCompanyShortDate(subtask.dueDate)}
                </>
              ) : (
                <>
                  <ClockIcon className="size-3.5" />
                  No due date
                </>
              )}
            </div>
          </div>
          <span
            className={cn(
              'inline-block shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wide',
              subtaskStatusStyles[subtask.status],
            )}
          >
            {subtaskStatusLabels[subtask.status]}
          </span>
        </Card>
      ))}

      <Card className="px-5 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          Project Progress
        </p>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className="h-full rounded-full bg-[#1877f2] transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-heading">{task.progress}%</span>
        </div>
      </Card>
    </div>
  )
}
