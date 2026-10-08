import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { useAuth } from '@/features/auth/model/AuthContext'
import { isCompanyHubEnabled } from '@/features/auth/model/companyHubs'
import { performanceApi } from '@/features/performance/api/performanceApi'
import type { PerformanceSummary } from '@/features/performance/model/contracts'
import { StarIcon } from '@/features/dashboard/employee/ui/employeeIcons'

export function EmployeePerformanceCard() {
  const { user } = useAuth()
  const workHub = isCompanyHubEnabled(user?.enabledHubs, 'work')
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    void performanceApi
      .getSummary(user.id)
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoaded(true))
  }, [user?.id])

  const hasData =
    summary != null &&
    (summary.overallRating != null ||
      summary.efficiency > 0 ||
      summary.tasksCompleted > 0 ||
      summary.projects > 0)

  const overall = summary?.efficiency ?? 0
  const progressData = [{ value: overall }, { value: 100 - overall }]

  return (
    <div className="flex min-h-[280px] flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:min-h-[300px] sm:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">
          My Performance
        </h3>
        {loaded && hasData ? (
          <Link to="/performance" className="text-sm font-semibold text-primary hover:opacity-90">
            View details
          </Link>
        ) : null}
      </div>

      {!loaded ? (
        <ComingSoonState
          className="flex-1"
          title="Loading…"
          description="Fetching your performance summary."
          compact
          minHeight="min-h-0"
        />
      ) : !hasData ? (
        <ComingSoonState
          className="flex-1"
          title="No performance yet"
          description="Your performance overview will show up here once reviews are available."
          minHeight="min-h-0"
        />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="relative h-[140px] w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={52}
                  outerRadius={66}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#1877F2" />
                  <Cell fill="#E2E8F0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-bold leading-8 text-[#1E293B]">{overall}%</span>
              <span className="text-[10px] font-bold tracking-wide text-[#64748B]">OVERALL</span>
            </div>
          </div>

          <div className="flex w-full flex-1 items-center justify-evenly gap-8 sm:justify-end sm:gap-16">
            <div className="flex flex-col gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Rating</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#1E293B]">
                    {summary?.overallRating ?? '—'}
                  </span>
                  <span className="inline-flex size-5 items-center justify-center">
                    <StarIcon className="size-3 text-[#FBBF24]" />
                  </span>
                </div>
              </div>
              {workHub && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                  Projects
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1E293B]">{summary?.projects ?? 0}</p>
              </div>
              )}
            </div>
            <div className="flex flex-col gap-8">
              {workHub && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                  Tasks Done
                </p>
                <p className="mt-1 text-2xl font-bold text-[#1E293B]">
                  {summary?.tasksCompleted ?? 0}
                </p>
              </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Status</p>
                <span className="mt-1 inline-block rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-bold uppercase text-[#166534]">
                  {summary?.status ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
