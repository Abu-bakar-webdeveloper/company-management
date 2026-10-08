import type { TaskStatCardData } from '@/features/tasks/lib/taskStatCards'
import { cn } from '@/shared/lib/cn'

export function TaskStatCard({ data }: { data: TaskStatCardData }) {
  return (
    <div className={cn('rounded-xl border bg-surface p-5 sm:p-[25px]', data.border)}>
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          data.iconBg,
          data.iconColor,
        )}
      >
        {data.iconNode}
      </div>
      <p className="mt-4 text-sm font-medium leading-5 text-text-muted">{data.label}</p>
      <p className="mt-1 text-xl font-bold leading-8 text-heading sm:text-[24px]">{data.value}</p>
    </div>
  )
}
