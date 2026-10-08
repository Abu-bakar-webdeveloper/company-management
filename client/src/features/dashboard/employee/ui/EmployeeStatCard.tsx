import type { MetricStatCardData } from '@/features/dashboard/ui/MetricStatCard'
import { cn } from '@/shared/lib/cn'

export function EmployeeStatCard({ data }: { data: MetricStatCardData }) {
  return (
    <div className={cn('rounded-lg border bg-surface p-5', data.border)}>
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          data.iconBg,
          data.iconColor,
        )}
      >
        {data.icon}
      </div>
      <p className="mt-3 text-sm font-medium leading-5 text-text-muted">{data.label}</p>
      <p className="mt-1 text-[20px] font-bold leading-8 text-heading sm:text-[22px]">{data.value}</p>
    </div>
  )
}
