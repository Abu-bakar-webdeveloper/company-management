import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

export function AdminStatCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-border-card bg-surface p-[25px]"
      aria-hidden
    >
      <div className="flex items-start justify-between">
        <Skeleton className="size-10" rounded="lg" />
        <Skeleton className="h-4 w-16" rounded="sm" />
      </div>
      <Skeleton className="mt-4 h-4 w-24" rounded="sm" />
      <Skeleton className="mt-2 h-8 w-16" rounded="md" />
    </div>
  )
}

export function AdminStatCardsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <AdminStatCardSkeleton key={i} />
      ))}
    </>
  )
}

const CHART_BAR_HEIGHTS = [
  'h-[40%]',
  'h-[55%]',
  'h-[35%]',
  'h-[70%]',
  'h-[48%]',
  'h-[62%]',
  'h-[45%]',
  'h-[78%]',
  'h-[52%]',
  'h-[68%]',
] as const

export function ChartAreaSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col justify-end gap-3" aria-busy aria-label="Loading">
      <div className="flex flex-1 items-end gap-2 px-1 pb-2">
        {CHART_BAR_HEIGHTS.map((heightClass, i) => (
          <Skeleton key={i} className={`w-full ${heightClass}`} rounded="sm" />
        ))}
      </div>
      <div className="flex justify-between px-1">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-2.5 w-8" rounded="sm" />
        ))}
      </div>
    </div>
  )
}

export function PerformanceOverviewSkeleton() {
  return (
    <div
      className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-[1fr_auto]"
      aria-busy
      aria-label="Loading"
    >
      <div>
        <Skeleton className="mb-4 h-3 w-28" rounded="sm" />
        <ul className="flex flex-col gap-5">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10" rounded="full" />
                <Skeleton className="h-4 w-28" rounded="sm" />
              </div>
              <Skeleton className="h-4 w-8" rounded="sm" />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl bg-[#f8fafc] px-6 py-5 sm:min-w-[274px]">
        <Skeleton className="size-32" rounded="full" />
        <Skeleton className="mt-3 h-4 w-32" rounded="sm" />
        <Skeleton className="mt-2 h-3 w-24" rounded="sm" />
      </div>
    </div>
  )
}

export function LeaveTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto" aria-busy aria-label="Loading">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="bg-table-header">
            {Array.from({ length: 4 }, (_, i) => (
              <th key={i} className="px-6 py-3.5">
                <Skeleton className="h-3 w-20" rounded="sm" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row} className="border-t border-border-card">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8" rounded="full" />
                  <Skeleton className="h-4 w-28" rounded="sm" />
                </div>
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" rounded="sm" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-32" rounded="sm" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-20" rounded="full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ActivitiesListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="flex flex-col gap-6" aria-busy aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex gap-4">
          <Skeleton className="size-10 shrink-0" rounded="full" />
          <div className="min-w-0 flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-40" rounded="sm" />
            <Skeleton className="h-3 w-56" rounded="sm" />
            <Skeleton className="h-2.5 w-16" rounded="sm" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ChartCardSkeleton({
  titleWidth = 'w-44',
  className,
}: {
  titleWidth?: string
  className?: string
}) {
  return (
    <Card className={className} aria-busy aria-label="Loading">
      <div className="mb-4 flex items-start justify-between gap-4 p-[25px] pb-0">
        <Skeleton className={`h-6 ${titleWidth}`} rounded="sm" />
        <Skeleton className="h-8 w-24" rounded="lg" />
      </div>
      <div className="min-h-0 flex-1 px-[25px] pb-[25px]">
        <ChartAreaSkeleton />
      </div>
    </Card>
  )
}
