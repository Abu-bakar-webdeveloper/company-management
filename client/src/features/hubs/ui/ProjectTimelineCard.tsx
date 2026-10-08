import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { formatTimelineRange } from '@/features/projects/lib/project-utils'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

type TimelineProject = {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  progress: number
}

type ProjectTimelineCardProps = {
  projects: TimelineProject[]
}

function parseDay(iso: string): number {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? 0 : t
}

export function ProjectTimelineCard({ projects }: ProjectTimelineCardProps) {
  const active = projects
    .filter((p) => p.status === 'in_progress' || p.status === 'delayed')
    .slice(0, 6)

  const minStart = Math.min(...active.map((p) => parseDay(p.startDate)), Date.now())
  const maxEnd = Math.max(...active.map((p) => parseDay(p.endDate)), Date.now())
  const span = Math.max(maxEnd - minStart, 1)

  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">Project timeline</h3>
        <span className="text-xs font-semibold text-text-muted">Active delivery</span>
      </div>
      {active.length === 0 ? (
        <ComingSoonState
          className="flex-1"
          title="No active projects"
          description="Active project date ranges will appear here."
          minHeight="min-h-0"
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {active.map((project) => {
            const start = parseDay(project.startDate)
            const end = parseDay(project.endDate)
            const left = ((start - minStart) / span) * 100
            const width = Math.max(((end - start) / span) * 100, 4)
            const delayed = project.status === 'delayed'
            return (
              <li key={project.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-heading">{project.name}</span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatTimelineRange(project.startDate, project.endDate)}
                  </span>
                </div>
                <div className="relative h-2.5 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className={cn(
                      'absolute top-0 h-full rounded-full',
                      delayed ? 'bg-[#DC2626]' : 'bg-primary',
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
