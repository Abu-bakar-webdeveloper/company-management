import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { PlanMixChartSkeleton } from '@/features/dashboard/superadmin/ui/SuperAdminDashboardSkeletons'
import { useCompaniesList, useCompanyStats } from '@/features/platform/hooks/useCompanies'
import { Card } from '@/shared/ui/Card'

const PLAN_COLORS: Record<string, string> = {
  pro: '#1877f2',
  basic: '#00b67a',
  enterprise: '#9333ea',
}

const PLAN_LABELS: Record<string, string> = {
  pro: 'Pro',
  basic: 'Basic',
  enterprise: 'Enterprise',
}

export function RevenueDonutChart() {
  const statsQuery = useCompanyStats()
  const companiesQuery = useCompaniesList({ page: 1, limit: 100 })

  const { segments, totalCompanies } = useMemo(() => {
    const companies = companiesQuery.data?.companies ?? []
    const total = statsQuery.data?.totalCompanies ?? companies.length
    if (companies.length === 0) {
      return { segments: [] as Array<{ name: string; value: number; color: string }>, totalCompanies: total }
    }

    const counts: Record<string, number> = {}
    for (const company of companies) {
      const plan = company.plan || 'basic'
      counts[plan] = (counts[plan] ?? 0) + 1
    }

    const sampleTotal = companies.length
    const segments = Object.entries(counts).map(([plan, count]) => ({
      name: PLAN_LABELS[plan] ?? plan,
      value: Math.round((count / sampleTotal) * 100),
      color: PLAN_COLORS[plan] ?? '#94a3b8',
    }))

    const valueSum = segments.reduce((sum, s) => sum + s.value, 0)
    if (segments.length > 0 && valueSum !== 100) {
      segments[0].value += 100 - valueSum
    }

    return { segments, totalCompanies: total }
  }, [companiesQuery.data, statsQuery.data])

  return (
    <Card className="flex h-auto min-h-72 flex-col p-4 sm:min-h-89 sm:p-6 col-span-full md:col-span-2 xl:col-span-2 xl:h-89">
      <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6">
        <div>
          <h3 className="text-lg font-semibold leading-6 text-heading sm:text-[18px] lg:text-2xl">
            Plan Mix
          </h3>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">Companies by subscription plan</p>
        </div>
      </div>

      {companiesQuery.isLoading || statsQuery.isLoading ? (
        <PlanMixChartSkeleton />
      ) : companiesQuery.isError ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-xs text-danger sm:text-sm">Unable to load companies.</p>
        </div>
      ) : segments.length === 0 ? (
        <ComingSoonState
          className="flex-1"
          title="No companies yet"
          description="Plan mix will show up here once companies are added."
          minHeight="min-h-0"
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 xl:flex-row xl:gap-8 xl:justify-between">
          <div className="relative aspect-square w-full max-w-36 shrink-0 sm:max-w-40 md:max-w-44 lg:max-w-50">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: 100 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius="62%"
                  outerRadius="92%"
                  dataKey="value"
                  stroke="none"
                  isAnimationActive={false}
                >
                  <Cell fill="#f1f5f9" />
                </Pie>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  innerRadius="52%"
                  outerRadius="72%"
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  {segments.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold leading-7 text-[#0F172A] sm:text-lg lg:text-2xl lg:leading-8">
                {totalCompanies}
              </span>
              <span className="text-[10px] font-bold text-[#94A3B8] sm:text-xs lg:text-sm">Companies</span>
            </div>
          </div>

          <ul className="flex w-full flex-wrap justify-center gap-x-5 gap-y-3 sm:w-auto sm:max-w-none sm:flex-col sm:flex-nowrap sm:justify-center sm:gap-5">
            {segments.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-2.5 text-xs text-text-muted sm:gap-3 sm:text-sm"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="whitespace-nowrap">
                  {item.name} — {item.value}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
