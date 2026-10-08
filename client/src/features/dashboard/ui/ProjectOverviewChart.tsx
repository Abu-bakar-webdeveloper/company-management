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
import { ChartAreaSkeleton } from '@/features/dashboard/ui/DashboardSkeletons'
import {
  MonthRangeFilter,
  type MonthRange,
} from '@/features/dashboard/ui/MonthRangeFilter'
import { useProjectOverview } from '@/features/projects/hooks/useProjects'
import { Card } from '@/shared/ui/Card'

type OverviewPoint = {
  month: string
  active: number
  completed: number
  activeCount: number
  completedCount: number
}

function ProjectTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: OverviewPoint }>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null

  return (
    <div className="rounded-lg border border-border-card bg-surface px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-2 text-[10px] leading-[20px] font-medium text-heading">
        <span className="size-2 rounded-full bg-chart-active" />
        {row.activeCount} Projects
      </div>
      <div className="mt-1 flex items-center gap-2 text-[10px] leading-[20px] font-medium text-heading">
        <span className="size-2 rounded-full bg-chart-completed" />
        {row.completedCount} Projects
      </div>
    </div>
  )
}

export function ProjectOverviewChart() {
  const [months, setMonths] = useState<MonthRange>(6)
  const overview = useProjectOverview(months)
  const data = overview.data ?? []
  const hasData = data.some((d) => d.activeCount > 0 || d.completedCount > 0)
  const maxVal = Math.max(1, ...data.flatMap((d) => [d.active, d.completed]))
  const yMax = Math.ceil(maxVal / 5) * 5 || 5

  return (
    <Card className="flex h-[358px] flex-col p-[25px]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[24px] leading-6 font-semibold text-heading">Project Overview</h3>
        {hasData ? (
          <div className="flex flex-col items-end gap-3">
            <MonthRangeFilter value={months} onChange={setMonths} />
            <div className="flex items-center gap-4 text-[10px] leading-[100%] font-normal text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-active" />
                Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-completed" />
                Completed
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 min-h-0 flex-1">
        {overview.isLoading ? (
          <ChartAreaSkeleton />
        ) : overview.isError || !hasData ? (
          <ComingSoonState
            title="No project yet"
            description="Add projects to see a trend overview here."
            minHeight="min-h-0 h-full"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: months > 6 ? 10 : 12 }}
                dy={8}
                interval={months > 6 ? 1 : 0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, yMax]}
                width={28}
                allowDecimals={false}
              />
              <Tooltip
                content={<ProjectTooltip />}
                cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey="active"
                stroke="#ff5c00"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#ff5c00', stroke: '#fff', strokeWidth: 2 }}
                filter="drop-shadow(0px 2px 4px rgba(255, 92, 0, 0.25))"
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#1877f2"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#1877f2', stroke: '#fff', strokeWidth: 2 }}
                filter="drop-shadow(0px 2px 4px rgba(24, 119, 242, 0.25))"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
