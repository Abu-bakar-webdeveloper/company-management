import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import {
  MonthRangeFilter,
  type MonthRange,
} from '@/features/dashboard/ui/MonthRangeFilter'
import { CompanyGrowthChartSkeleton } from '@/features/dashboard/superadmin/ui/SuperAdminDashboardSkeletons'
import { useCompanyGrowth } from '@/features/platform/hooks/useCompanies'
import { Card } from '@/shared/ui/Card'

function GrowthTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ dataKey?: string; value?: number; color?: string }>
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border-card bg-surface px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center gap-2 text-[10px] font-medium leading-5 text-heading"
        >
          <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === 'newCompanies' ? 'New Companies' : 'Total Users'}: {entry.value}
        </div>
      ))}
    </div>
  )
}

/** Evenly spaced integer ticks so both axes and grid lines stay aligned. */
function axisScale(maxValue: number, tickCount = 5): { max: number; ticks: number[] } {
  const safeMax = Math.max(1, maxValue)
  const step = Math.max(1, Math.ceil(safeMax / (tickCount - 1)))
  const max = step * (tickCount - 1)
  return {
    max,
    ticks: Array.from({ length: tickCount }, (_, i) => i * step),
  }
}

export function CompanyGrowthChart() {
  const [months, setMonths] = useState<MonthRange>(6)
  const growth = useCompanyGrowth(months)
  const data = growth.data ?? []
  const hasData = data.some((d) => d.newCompanies > 0 || d.totalUsers > 0)
  const leftAxis = axisScale(Math.max(0, ...data.map((d) => d.newCompanies)))
  const rightAxis = axisScale(Math.max(0, ...data.map((d) => d.totalUsers)))

  return (
    <Card className="flex h-89 flex-col p-6 col-span-full md:col-span-2 xl:col-span-3">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[18px] lg:text-[24px] font-semibold leading-6 text-heading">
          Company Growth
        </h3>
        {hasData ? (
          <div className="flex flex-col items-end gap-2 lg:gap-3">
            <MonthRangeFilter value={months} onChange={setMonths} size="sm" />
            <div className="flex items-center gap-4 text-[10px] font-normal leading-[100%] text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-active" />
                New Companies
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-completed" />
                Total Users
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 min-h-0 flex-1">
        {growth.isLoading ? (
          <CompanyGrowthChartSkeleton />
        ) : growth.isError || !hasData ? (
          <ComingSoonState
            title="No growth yet"
            description="Company growth trends will show up here once data is available."
            minHeight="min-h-0 h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="0" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: months > 6 ? 10 : 12 }}
                dy={8}
                interval={months > 6 ? 1 : 0}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, leftAxis.max]}
                ticks={leftAxis.ticks}
                width={28}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, rightAxis.max]}
                ticks={rightAxis.ticks}
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                content={<GrowthTooltip />}
                cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="newCompanies"
                stroke="#ff5c00"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#ff5c00', stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalUsers"
                stroke="#1877f2"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#1877f2', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
