import { Skeleton } from '@/shared/ui/Skeleton'
import { Card } from '@/shared/ui/Card'

export function MyPerformancePageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading performance">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" rounded="md" />
          <Skeleton className="mt-2 h-4 w-56" rounded="sm" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" rounded="lg" />
          <Skeleton className="h-10 w-36" rounded="lg" />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-border-card bg-surface p-[25px]">
            <div className="flex items-start justify-between">
              <Skeleton className="size-10" rounded="lg" />
              <Skeleton className="h-6 w-14" rounded="full" />
            </div>
            <Skeleton className="mt-4 h-4 w-24" rounded="sm" />
            <Skeleton className="mt-2 h-8 w-28" rounded="md" />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-h-[300px] p-[25px]">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-40" rounded="sm" />
            <Skeleton className="h-6 w-20" rounded="full" />
          </div>
          <div className="flex h-[220px] items-end gap-3 px-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${40 + ((i * 37) % 60)}%` }}
                rounded="sm"
              />
            ))}
          </div>
        </Card>
        <Card className="min-h-[300px] p-[25px]">
          <Skeleton className="mb-6 h-5 w-44" rounded="sm" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <div className="mb-2 flex justify-between">
                  <Skeleton className="h-4 w-32" rounded="sm" />
                  <Skeleton className="h-4 w-10" rounded="sm" />
                </div>
                <Skeleton className="h-2 w-full" rounded="full" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-card px-6 py-4">
          <Skeleton className="h-5 w-36" rounded="sm" />
          <Skeleton className="h-4 w-16" rounded="sm" />
        </div>
        <div className="divide-y divide-border-card">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="h-4 w-20" rounded="sm" />
              <Skeleton className="h-4 w-12" rounded="sm" />
              <Skeleton className="h-4 w-24" rounded="sm" />
              <Skeleton className="h-2 flex-1" rounded="full" />
              <Skeleton className="size-9" rounded="lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function PerformanceHubSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Loading performance hub">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-8 w-44" rounded="md" />
          <Skeleton className="mt-2 h-4 w-64" rounded="sm" />
        </div>
        <Skeleton className="h-10 w-32" rounded="lg" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-border-card bg-surface p-[25px]">
            <Skeleton className="size-10" rounded="lg" />
            <Skeleton className="mt-4 h-4 w-24" rounded="sm" />
            <Skeleton className="mt-2 h-8 w-20" rounded="md" />
          </div>
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-h-[300px] p-[25px]">
          <Skeleton className="mb-4 h-5 w-40" rounded="sm" />
          <Skeleton className="h-[220px] w-full" rounded="lg" />
        </Card>
        <Card className="min-h-[300px] p-[25px]">
          <Skeleton className="mb-4 h-5 w-48" rounded="sm" />
          <Skeleton className="h-[220px] w-full" rounded="lg" />
        </Card>
      </div>
      <Card className="min-h-[200px] p-[25px]">
        <Skeleton className="mb-4 h-5 w-36" rounded="sm" />
        <Skeleton className="h-32 w-full" rounded="lg" />
      </Card>
    </div>
  )
}
