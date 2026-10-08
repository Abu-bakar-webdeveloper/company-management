import { DashboardSectionHeader } from '@/features/dashboard/ui/DashboardSectionHeader'
import { Card } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'

type CompaniesTableSkeletonProps = {
  rows?: number
  showViewAll?: boolean
  showPagination?: boolean
}

export function CompaniesTableSkeleton({
  rows = 4,
  showViewAll = true,
  showPagination = true,
}: CompaniesTableSkeletonProps) {
  return (
    <Card className="overflow-hidden">
      {showViewAll ? <DashboardSectionHeader title="Recently Added Companies" /> : null}

      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="rounded-xl border border-border-card bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="size-8 shrink-0 rounded-lg" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border-card pt-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[14%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-table-header text-xs font-semibold uppercase leading-4 tracking-wide text-heading">
              <th className="px-4 py-3.5">Company</th>
              <th className="px-4 py-3.5">Plan</th>
              <th className="px-4 py-3.5">Users</th>
              <th className="px-4 py-3.5">User Limit</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, i) => (
              <tr key={i} className="border-t border-border-card">
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-36 max-w-full" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-8" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-10" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </td>
                <td className="px-4 py-4">
                  <div className="mx-auto flex justify-center">
                    <Skeleton className="size-8 rounded-lg" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination ? (
        <div className="flex flex-col gap-3 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
          </div>
        </div>
      ) : null}
    </Card>
  )
}
