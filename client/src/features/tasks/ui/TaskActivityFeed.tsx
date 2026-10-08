import type { TaskActivity } from '@/features/tasks/model/types'
import { ActivityIcon } from '@/features/tasks/ui/taskDetailIcons'
import { Card } from '@/shared/ui/Card'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function TaskActivityFeed({ activities }: { activities: TaskActivity[] }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-heading">Recent Activity</h3>
        </div>
        <button type="button" className="text-xs font-semibold text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center text-primary">
              <ActivityIcon />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-heading">
                <span className="font-semibold">{activity.actor}</span> {activity.action}{' '}
                {activity.target && (
                  <span className="font-semibold text-primary">{activity.target}</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-muted">{relativeTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
