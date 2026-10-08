import type { ProjectActivity } from '@/features/projects/model/types'
import { ActivityIcon } from '@/features/projects/ui/icons'
import { Card } from '@/shared/ui/Card'

export function ProjectActivityFeed({ activities }: { activities: ProjectActivity[] }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <ActivityIcon className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold uppercase tracking-wide text-heading">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-text-muted">No recent activity yet.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center text-primary">
                <ActivityIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-heading">
                  <span className="font-semibold">{activity.actor}</span> {activity.action}{' '}
                  {activity.target && (
                    <span className="font-semibold text-primary">{activity.target}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
