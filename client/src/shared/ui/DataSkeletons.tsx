import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type TableSkeletonProps = {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 6, rows = 8 }: TableSkeletonProps) {
  return (
    <Card className="overflow-hidden" aria-busy aria-label="Loading">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="bg-table-header">
              {Array.from({ length: columns }, (_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-3 w-20" rounded="sm" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, row) => (
              <tr key={row} className="border-t border-border-card">
                {Array.from({ length: columns }, (_, col) => (
                  <td key={col} className="px-4 py-4">
                    <Skeleton
                      className={col === 0 ? 'h-4 w-36' : 'h-4 w-24'}
                      rounded="sm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function DetailCardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy aria-label="Loading">
      <Skeleton className="mb-4 h-4 w-32" rounded="sm" />
      <div className="mb-6 rounded-xl border border-border-card bg-surface p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" rounded="md" />
            <Skeleton className="h-4 w-28" rounded="sm" />
            <Skeleton className="h-4 w-40" rounded="sm" />
          </div>
          <Skeleton className="h-10 w-28" rounded="lg" />
        </div>
      </div>
      <div className="mb-6 flex gap-4">
        <Skeleton className="h-10 w-24" rounded="sm" />
        <Skeleton className="h-10 w-24" rounded="sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-2 h-3 w-24" rounded="sm" />
            <Skeleton className="h-7 w-16" rounded="md" />
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <Skeleton className="mb-4 h-5 w-32" rounded="sm" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" rounded="sm" />
          <Skeleton className="h-4 w-[83%]" rounded="sm" />
          <Skeleton className="h-4 w-[66%]" rounded="sm" />
        </div>
      </Card>
    </div>
  )
}

export function FormCardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy aria-label="Loading">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" rounded="md" />
          <Skeleton className="h-4 w-72" rounded="sm" />
        </div>
        <Card className="space-y-5 p-6">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" rounded="sm" />
              <Skeleton className="h-10 w-full" rounded="lg" />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-10 w-24" rounded="lg" />
            <Skeleton className="h-10 w-32" rounded="lg" />
          </div>
        </Card>
      </div>
    </div>
  )
}
