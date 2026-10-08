import type { TaskDetail, TaskStatus } from '@/features/tasks/model/types'
import { CalendarIcon } from '@/features/tasks/ui/taskDetailIcons'
import { formatCompanyLongDate } from '@/shared/lib/format'
import { Card } from '@/shared/ui/Card'

const statusLabels: Record<TaskStatus, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
  hold: 'On Hold',
  overdue: 'Overdue',
}

export function TaskTimelineCard({ task }: { task: TaskDetail }) {
  return (
    <Card className="bg-[#eff6ff] p-5">
      <div className="mb-4 flex items-center gap-2">
        <CalendarIcon className="text-heading" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-heading">Timeline</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-heading">Start Date</p>
          <p className="mt-1 text-sm font-medium text-text-muted">{formatCompanyLongDate(task.startDate)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-heading">Deadline</p>
          <p className="mt-1 text-sm font-medium text-text-muted">{formatCompanyLongDate(task.deadline)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-heading">Current Status</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-sm font-bold text-primary">{statusLabels[task.status]}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
