import type { TaskDetail } from '@/features/tasks/model/types'
import { AvatarCircle } from '@/features/projects/ui/icons'
import { TaskDetailPriorityBadge } from '@/features/tasks/ui/TaskDetailPriorityBadge'
import { cn } from '@/shared/lib/cn'

const tabs = [{ id: 'tasks', label: 'Tasks' }] as const

type TaskDetailHeaderProps = {
  task: TaskDetail
}

export function TaskDetailHeader({ task }: TaskDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row">
        {task.image && (
          <div className="h-[150px] w-full shrink-0 overflow-hidden rounded-xl bg-[#f1f5f9] lg:h-[150px] lg:w-[210px]">
            <img src={task.image} alt={task.name} className="size-full object-cover" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <TaskDetailPriorityBadge priority={task.priority} />
              <h2 className="mt-2 text-2xl font-bold text-heading">{task.name}</h2>
              <p className="mt-1 text-sm text-text-muted">{task.code}</p>
              <p className="mt-2 text-sm text-heading">{task.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <AvatarCircle
                name={task.leadName}
                avatar={task.leadAvatar}
                className="size-10"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-heading">{task.leadName}</p>
                <p className="text-sm text-text-muted">{task.leadRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-border-card px-5 sm:px-6">
        {tabs.map((tab) => (
          <span
            key={tab.id}
            className={cn(
              'border-b-2 border-primary pb-3 pt-2 text-xs font-bold text-primary',
            )}
          >
            {tab.label}
          </span>
        ))}
      </div>
    </>
  )
}
