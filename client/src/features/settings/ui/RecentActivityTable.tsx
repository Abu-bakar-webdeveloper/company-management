import type { ReactNode } from 'react'
import type { ActivityFeedItem } from '@/features/notifications/model/types'
import { formatRelativeTime } from '@/features/notifications/lib/notification-utils'
import {
  AlertTriangleIcon,
  BriefcaseIcon,
  ListIcon,
} from '@/features/settings/ui/icons'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'
import { cn } from '@/shared/lib/cn'

const activityIcons: Record<
  ActivityFeedItem['icon'],
  { icon: (props: { className?: string }) => ReactNode; className: string }
> = {
  check: { icon: ListIcon, className: 'bg-[#ECFDF5] text-[#00B67A]' },
  user: { icon: BriefcaseIcon, className: 'bg-[#EFF6FF] text-[#1877F2]' },
  warning: { icon: AlertTriangleIcon, className: 'bg-[#FEF2F2] text-[#DC2626]' },
}

function ActivityCell({ activity }: { activity: ActivityFeedItem }) {
  const { icon: Icon, className } = activityIcons[activity.icon]
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', className)}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <span className="block truncate font-semibold text-heading">{activity.title}</span>
        {activity.description ? (
          <span className="block truncate text-xs text-text-muted">{activity.description}</span>
        ) : null}
      </div>
    </div>
  )
}

function ModuleBadge({ module }: { module: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1877F2]">
      {module}
    </span>
  )
}

export function RecentActivityTable({
  activities,
  page,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
}: {
  activities: ActivityFeedItem[]
  page: number
  total: number
  rangeStart: number
  rangeEnd: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const hasData = activities.length > 0

  const pageNumbers =
    totalPages <= 3
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, 3]
        : page >= totalPages - 1
          ? [totalPages - 2, totalPages - 1, totalPages]
          : [page - 1, page, page + 1]

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h3 className="text-base font-bold text-heading sm:text-lg">Recent System Activity</h3>
      </div>

      {!hasData ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title="No activities yet"
            description="System activity will show up here as changes are made."
            minHeight="min-h-[220px]"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <ActivityCell activity={activity} />
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-text-muted">Module</dt>
                    <dd>
                      <ModuleBadge module={activity.module} />
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="shrink-0 text-text-muted">When</dt>
                    <dd className="text-right text-heading">
                      {formatRelativeTime(activity.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-table-header text-xs font-semibold uppercase tracking-wide text-heading">
                  <th className="px-6 py-3.5">Activity</th>
                  <th className="px-6 py-3.5">Module</th>
                  <th className="px-6 py-3.5">When</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-t border-border-card">
                    <td className="px-6 py-4">
                      <ActivityCell activity={activity} />
                    </td>
                    <td className="px-6 py-4">
                      <ModuleBadge module={activity.module} />
                    </td>
                    <td className="px-6 py-4 text-heading">
                      {formatRelativeTime(activity.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-border-card bg-table-header px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-center text-sm text-text-muted sm:text-left">
              Showing {rangeStart} to {rangeEnd} of {total} results
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium',
                    pageNum === page
                      ? 'bg-[#1877f2] text-white'
                      : 'border border-border bg-surface text-text-muted hover:bg-surface-muted',
                  )}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
