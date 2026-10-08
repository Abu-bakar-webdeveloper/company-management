import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

export function StatCardSkeleton() {
  return (
    <div
      className="flex min-h-[148px] flex-col rounded-xl border border-border-card bg-surface p-6 shadow-(--shadow-stat)"
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-10" rounded="lg" />
        <Skeleton className="h-4 w-16" rounded="sm" />
      </div>
      <div className="mt-4 flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-24" rounded="sm" />
        <Skeleton className="h-8 w-20" rounded="md" />
        <Skeleton className="mt-auto h-3 w-28" rounded="sm" />
      </div>
    </div>
  )
}

export function StatCardsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </>
  )
}

const GROWTH_BAR_HEIGHTS = [
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

export function CompanyGrowthChartSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col justify-end gap-3" aria-busy aria-label="Loading">
      <div className="flex flex-1 items-end gap-2 px-1 pb-2">
        {GROWTH_BAR_HEIGHTS.map((heightClass, i) => (
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

export function PlanMixChartSkeleton() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8"
      aria-busy
      aria-label="Loading"
    >
      <Skeleton className="aspect-square w-full max-w-36 sm:max-w-40 md:max-w-44 lg:max-w-50" rounded="full" />
      <ul className="flex w-full flex-wrap justify-center gap-x-5 gap-y-3 sm:w-auto sm:flex-col sm:gap-5">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <Skeleton className="size-2.5" rounded="full" />
            <Skeleton className="h-3.5 w-24" rounded="sm" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RecentCompaniesTableSkeleton() {
  return (
    <>
      <Card className="hidden overflow-hidden lg:block" aria-busy aria-label="Loading">
        <div className="flex items-center justify-between border-b border-border-card px-6 py-4">
          <Skeleton className="h-6 w-44" rounded="sm" />
          <Skeleton className="h-4 w-16" rounded="sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-table-header">
                {Array.from({ length: 5 }, (_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-3 w-20" rounded="sm" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 3 }, (_, row) => (
                <tr key={row} className="border-t border-border-card">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9" rounded="lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" rounded="sm" />
                        <Skeleton className="h-3 w-24" rounded="sm" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-16" rounded="full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-6 w-16" rounded="full" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="h-4 w-20" rounded="sm" />
                  </td>
                  <td className="px-4 py-4">
                    <Skeleton className="size-8" rounded="md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-3 lg:hidden" aria-busy aria-label="Loading">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <Skeleton className="h-6 w-44" rounded="sm" />
            <Skeleton className="h-4 w-16" rounded="sm" />
          </div>
        </Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 max-w-full" rounded="sm" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" rounded="full" />
                    <Skeleton className="h-6 w-20" rounded="full" />
                  </div>
                </div>
                <Skeleton className="size-8 shrink-0" rounded="lg" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-card pt-3">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12" rounded="sm" />
                  <Skeleton className="h-4 w-8" rounded="sm" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" rounded="sm" />
                  <Skeleton className="h-4 w-10" rounded="sm" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
