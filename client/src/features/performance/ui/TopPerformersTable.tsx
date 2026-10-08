import { Link } from 'react-router-dom'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { PerformanceRecord } from '@/features/performance/model/types'
import { EfficiencyBar } from '@/features/performance/ui/EfficiencyBar'
import { AvatarCircle, EyeIcon, StarIcon } from '@/features/performance/ui/icons'
import { Card } from '@/shared/ui/Card'

type TopPerformersTableProps = {
  performers: PerformanceRecord[]
  viewAllLink?: string
  title?: string
}

export function TopPerformersTable({
  performers,
  viewAllLink = '/performance#performance-list',
  title = 'Top Performers',
}: TopPerformersTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border-card px-4 py-4 sm:px-6">
        <h3 className="text-lg font-bold text-heading">{title}</h3>
        {performers.length > 0 ? (
          <Link to={viewAllLink} className="text-sm font-semibold text-primary hover:opacity-90">
            View All
          </Link>
        ) : null}
      </div>

      {performers.length === 0 ? (
        <div className="p-4 sm:p-6">
          <ComingSoonState
            title="No top performers yet"
            description="Top performers will appear here once reviews are available."
            minHeight="min-h-[280px]"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
            {performers.map((p) => (
              <div
                key={p.employeeId}
                className="rounded-xl border border-border-card bg-surface p-4"
              >
                <div className="flex items-center gap-3">
                  <AvatarCircle name={p.employeeName} avatar={p.employeeAvatar} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-heading">{p.employeeName}</p>
                    <p className="text-xs text-text-muted">{p.role}</p>
                  </div>
                  <Link
                    to={`/performance/${p.employeeId}`}
                    className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary"
                    aria-label={`View ${p.employeeName}`}
                  >
                    <EyeIcon />
                  </Link>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-text-muted">KPI Score</dt>
                    <dd className="flex items-center gap-1 font-semibold text-heading">
                      {p.finalAdjustedScore != null ? (
                        p.finalAdjustedScore
                      ) : (
                        <>
                          {p.rating} <StarIcon className="size-3 text-[#FBBF24]" />
                        </>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Tasks</dt>
                    <dd className="font-semibold text-heading">{p.tasksCompleted}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="mb-1 text-text-muted">Efficiency</dt>
                    <dd>
                      <EfficiencyBar value={p.efficiency} />
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-card text-xs font-bold uppercase tracking-wide text-text-muted">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">KPI Score</th>
                  <th className="px-6 py-4">Tasks</th>
                  <th className="px-6 py-4">Efficiency</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {performers.map((p) => (
                  <tr key={p.employeeId} className="border-b border-border-card last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={p.employeeName} avatar={p.employeeAvatar} />
                        <span className="font-semibold text-heading">{p.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{p.role}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-heading">
                        {p.finalAdjustedScore != null ? (
                          p.finalAdjustedScore
                        ) : (
                          <>
                            {p.rating}
                            <StarIcon className="size-3.5 text-[#FBBF24]" />
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-heading">{p.tasksCompleted}</td>
                    <td className="px-6 py-4">
                      <EfficiencyBar value={p.efficiency} className="max-w-[140px]" />
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/performance/${p.employeeId}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] text-primary hover:opacity-90"
                        aria-label={`View ${p.employeeName}`}
                      >
                        <EyeIcon />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}
