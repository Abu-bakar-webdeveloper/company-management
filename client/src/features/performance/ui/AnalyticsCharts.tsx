import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsBundle } from '@/features/performance/model/contracts'
import { EfficiencyBar } from '@/features/performance/ui/EfficiencyBar'
import { PerformanceStatusBadge } from '@/features/performance/ui/PerformanceStatusBadge'
import { StarIcon } from '@/features/performance/ui/icons'
import { Card } from '@/shared/ui/Card'

type AnalyticsChartsProps = {
  analytics: AnalyticsBundle
}

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const {
    analyticsTrendData,
    departmentRatings,
    ratingDistribution,
    productivityData,
    topDepartmentPerformers,
    totalReviews,
    efficiencyChange,
  } = analytics

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-heading sm:text-lg">Performance Trend</h3>
            <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#00B67A]">
              {efficiencyChange >= 0 ? '+' : ''}
              {efficiencyChange}% vs prev
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analyticsTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1877F2" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
          <h3 className="mb-6 text-base font-bold text-heading sm:text-lg">Department Performance</h3>
          <ul className="flex flex-col gap-5">
            {departmentRatings.map((dept) => (
              <li key={dept.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-heading">{dept.name}</span>
                  <span className="font-semibold text-heading">{dept.rating} / 5.0</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(dept.rating / 5) * 100}%`, backgroundColor: dept.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
          <h3 className="mb-4 text-base font-bold text-heading sm:text-lg">Rating Distribution</h3>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row sm:justify-evenly">
            <div className="relative h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ratingDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    stroke="none"
                  >
                    {ratingDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-heading">{totalReviews}</span>
                <span className="text-[10px] text-text-muted">Total Reviews</span>
              </div>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              {ratingDistribution.map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-heading">{item.name}</span>
                  <span className="font-semibold text-text-muted">{item.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-bold text-heading sm:text-lg">Weekly Efficiency</h3>
            <div className="flex flex-wrap gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-[#7C3AED]" />
                Efficiency
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productivityData} barGap={4}>
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="efficiency" fill="#7C3AED" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-bold text-heading sm:text-lg">Top Performers</h3>
            <p className="text-sm text-text-muted">Department heads and team efficiency</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:hidden sm:p-6">
          {topDepartmentPerformers.map((row) => (
            <div key={row.id} className="rounded-xl border border-border-card bg-surface p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-heading">{row.department}</p>
                  <p className="text-sm text-text-muted">{row.head}</p>
                </div>
                <PerformanceStatusBadge status={row.status} />
              </div>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-text-muted">Avg Rating</span>
                <span className="inline-flex items-center gap-1 font-semibold text-heading">
                  {row.rating}
                  <StarIcon className="size-3.5 text-[#FBBF24]" />
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-text-muted">Efficiency</span>
                <EfficiencyBar
                  value={row.efficiency}
                  color={row.status === 'excellent' ? 'bg-[#00B67A]' : 'bg-primary'}
                  className="max-w-[140px] flex-1"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-card text-xs font-bold uppercase tracking-wide text-text-muted">
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Head</th>
                <th className="px-6 py-4">Avg Rating</th>
                <th className="px-6 py-4">Efficiency</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {topDepartmentPerformers.map((row) => (
                <tr key={row.id} className="border-b border-border-card last:border-0">
                  <td className="px-6 py-4 font-semibold text-heading">{row.department}</td>
                  <td className="px-6 py-4 text-text-muted">{row.head}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-heading">
                      {row.rating}
                      <StarIcon className="size-3.5 text-[#FBBF24]" />
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <EfficiencyBar
                      value={row.efficiency}
                      color={row.status === 'excellent' ? 'bg-[#00B67A]' : 'bg-primary'}
                      className="max-w-[140px]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <PerformanceStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
