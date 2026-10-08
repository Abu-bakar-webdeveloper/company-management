import { Skeleton } from '@/shared/ui/Skeleton'
import { Card } from '@/shared/ui/Card'

export function HubPageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading hub">
      <div className="mb-6">
        <Skeleton className="h-7 w-36 sm:h-8 sm:w-48" rounded="md" />
        <Skeleton className="mt-2 h-4 w-56 max-w-full sm:w-72" rounded="sm" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`mod-${i}`}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-border-card bg-surface p-3 sm:min-h-16 sm:p-4"
          >
            <Skeleton className="size-9 shrink-0 sm:size-10" rounded="lg" />
            <Skeleton className="h-4 w-20" rounded="sm" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-border-card bg-surface p-4 sm:p-5">
            <Skeleton className="size-9 sm:size-10" rounded="lg" />
            <Skeleton className="mt-3 h-4 w-24 sm:mt-4" rounded="sm" />
            <Skeleton className="mt-2 h-7 w-20 sm:h-8" rounded="md" />
            <Skeleton className="mt-2 h-3 w-28" rounded="sm" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-h-[300px] p-4 sm:p-6">
          <Skeleton className="mb-4 h-5 w-40" rounded="sm" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <div className="mb-2 flex justify-between">
                  <Skeleton className="h-4 w-28" rounded="sm" />
                  <Skeleton className="h-4 w-10" rounded="sm" />
                </div>
                <Skeleton className="h-2 w-full" rounded="full" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="min-h-[300px] p-4 sm:p-6">
          <Skeleton className="mb-4 h-5 w-36" rounded="sm" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9" rounded="full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-32" rounded="sm" />
                  <Skeleton className="mt-1 h-3 w-24" rounded="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
