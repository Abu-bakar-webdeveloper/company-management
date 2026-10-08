import { Card } from '@/shared/ui/Card'

export type UpcomingTask = {
  id: string
  title: string
  project: string
  due: string
}

type UpcomingTasksCardProps = {
  tasks: UpcomingTask[]
}

export function UpcomingTasksCard({ tasks }: UpcomingTasksCardProps) {
  return (
    <Card className="flex min-h-[334px] flex-col p-[25px]">
      <h3 className="mb-6 text-base font-semibold text-heading">Upcoming Tasks</h3>
      <ul className="flex flex-col gap-4">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-border-card px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading">{task.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">{task.project}</p>
            </div>
            <span className="shrink-0 rounded-full bg-primary-muted px-2.5 py-1 text-xs font-medium text-primary">
              {task.due}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
