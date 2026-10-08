import { Skeleton } from '@/shared/ui/Skeleton'

export function DashboardStatCardSkeleton() {
  return (
    <div className="flex min-h-[148px] flex-col rounded-xl border border-border-card bg-surface p-6 shadow-(--shadow-stat)">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-auto h-3 w-28" />
      </div>
    </div>
  )
}
