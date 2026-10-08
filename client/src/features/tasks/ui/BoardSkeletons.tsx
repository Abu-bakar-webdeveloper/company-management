import { Skeleton } from '@/shared/ui/Skeleton'

export function PendingTaskCardSkeleton() {
  return (
    <div
      className="mb-2.5 overflow-hidden rounded-xl border border-border-card border-l-[3px] border-l-border bg-surface p-3.5 shadow-[var(--shadow-stat)]"
      aria-busy
      aria-label="Adding card"
    >
      <div className="mb-2 flex gap-1.5">
        <Skeleton className="h-5 w-14" rounded="full" />
        <Skeleton className="h-5 w-20" rounded="full" />
      </div>
      <Skeleton className="mb-2.5 h-4 w-[80%]" rounded="sm" />
      <div className="flex items-center justify-between">
        <Skeleton className="size-6" rounded="full" />
        <Skeleton className="h-3 w-12" rounded="sm" />
      </div>
    </div>
  )
}

export function PendingColumnSkeleton({ name }: { name?: string }) {
  return (
    <div
      className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-dashed border-primary/40 bg-surface-muted p-2.5 opacity-80"
      aria-busy
      aria-label="Adding column"
    >
      <div className="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
        {name ? (
          <span className="truncate text-sm font-bold text-heading/60">{name}</span>
        ) : (
          <Skeleton className="h-4 w-28" rounded="sm" />
        )}
        <Skeleton className="h-5 w-6" rounded="full" />
      </div>
      <PendingTaskCardSkeleton />
      <PendingTaskCardSkeleton />
    </div>
  )
}

export function BoardLoadSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy aria-label="Loading board">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" rounded="sm" />
          <Skeleton className="h-7 w-48" rounded="md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" rounded="lg" />
          <Skeleton className="h-10 w-28" rounded="lg" />
        </div>
      </div>
      <div className="flex items-start gap-4 overflow-hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex w-[300px] shrink-0 flex-col rounded-2xl bg-surface-muted p-2.5"
          >
            <div className="mb-2.5 flex items-center justify-between px-1.5 pt-1">
              <Skeleton className="h-4 w-24" rounded="sm" />
              <Skeleton className="size-7" rounded="md" />
            </div>
            <PendingTaskCardSkeleton />
            <PendingTaskCardSkeleton />
            {i === 0 && <PendingTaskCardSkeleton />}
          </div>
        ))}
      </div>
    </div>
  )
}
