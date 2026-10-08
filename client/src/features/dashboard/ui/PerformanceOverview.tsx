import { useEffect, useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { PerformanceOverviewSkeleton } from '@/features/dashboard/ui/DashboardSkeletons'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { PerformanceStats } from '@/features/performance/model/types'
import { Card } from '@/shared/ui/Card'
import { UserAvatar } from '@/shared/ui/UserAvatar'
import { StarIcon } from '@/features/dashboard/ui/icons'

export function PerformanceOverview() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [topPerformers, setTopPerformers] = useState<
    { employeeId: string; employeeName: string; employeeAvatar?: string; rating: number }[]
  >([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    void Promise.all([performanceApi.getStats(), performanceApi.list({ limit: 5 })])
      .then(([statsData, listData]) => {
        setStats(statsData)
        setTopPerformers(
          listData.items
            .filter((item) => item.rating != null)
            .slice(0, 3)
            .map((item) => ({
              employeeId: item.employeeId,
              employeeName: item.employeeName,
              employeeAvatar: item.employeeAvatar,
              rating: item.rating ?? 0,
            })),
        )
      })
      .catch(() => {
        setStats(null)
      })
      .finally(() => setLoaded(true))
  }, [])

  const hasData = Boolean(stats && (stats.avgRating > 0 || topPerformers.length > 0))

  const reviewProgress = stats
    ? [
        { value: stats.reviewsDue === 0 ? 100 : Math.max(0, 100 - stats.reviewsDue * 5) },
        { value: stats.reviewsDue * 5 },
      ]
    : [{ value: 0 }, { value: 100 }]
  const completionPct = reviewProgress[0]?.value ?? 0

  return (
    <Card className="flex min-h-[334px] flex-col p-[25px]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-[24px] leading-6 font-semibold text-heading">Performance Overview</h3>
        {hasData ? (
          <span className="shrink-0 rounded-full bg-[#eff6ff] px-3 py-1 text-sm font-semibold text-[#1877f2]">
            Avg: {stats?.avgRating ?? '—'} / 5
          </span>
        ) : null}
      </div>

      {!loaded ? (
        <PerformanceOverviewSkeleton />
      ) : !hasData ? (
        <ComingSoonState
          className="flex-1"
          title="No performance yet"
          description="Add performance reviews to see an overview here."
          minHeight="min-h-0"
        />
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[1.2px] text-[#94a3b8]">
              Top Performers
            </p>
            {topPerformers.length === 0 ? (
              <p className="text-sm text-text-muted">No reviewed employees yet</p>
            ) : (
              <ul className="flex flex-col gap-5">
                {topPerformers.map((person) => (
                  <li key={person.employeeId} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={person.employeeName}
                        avatar={person.employeeAvatar}
                        size="lg"
                      />
                      <span className="text-sm font-bold text-heading">{person.employeeName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-[#1877f2]">{person.rating}</span>
                      <StarIcon className="size-3.5 text-[#fbbf24]" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-[#f8fafc] px-6 py-5 sm:min-w-[274px]">
            <div className="relative h-[128px] w-[128px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewProgress}
                    cx="50%"
                    cy="50%"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius={46}
                    outerRadius={58}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#00b67a" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-[24px] leading-[32px] font-bold text-heading">
                  {completionPct}%
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm font-bold text-heading">Reviews Completed</p>
            <p className="mt-0.5 text-xs font-normal text-text-muted">
              {stats ? `${stats.reviewsDue} reviews due` : '—'}
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
