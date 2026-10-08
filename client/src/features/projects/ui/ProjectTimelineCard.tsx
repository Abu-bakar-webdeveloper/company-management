import { formatProjectLongDate, statusLabel } from '@/features/projects/lib/project-utils'
import type { Project } from '@/features/projects/model/types'
import { CalendarIcon } from '@/features/projects/ui/icons'
import { Card } from '@/shared/ui/Card'

export function ProjectTimelineCard({ project }: { project: Project }) {
  return (
    <Card className="border border-border-card bg-surface p-5 ">
      <div className="mb-4 flex items-center gap-2">
        <CalendarIcon className="text-heading" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-heading">Timeline</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-heading">
            Start Date
          </p>
          <p className="mt-1 text-sm font-medium text-text-muted">
            {formatProjectLongDate(project.startDate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-heading">
            Deadline
          </p>
          <p className="mt-1 text-sm font-medium text-text-muted">
            {formatProjectLongDate(project.endDate)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-heading">
            Current Status
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-sm font-bold text-primary">
              {statusLabel(project.status)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
