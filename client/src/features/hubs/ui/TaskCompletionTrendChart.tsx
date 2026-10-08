import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { tasksApi, type TaskStatsScope } from '@/features/tasks/api/tasksApi'
import { queryKeys } from '@/shared/api/queryKeys'
import { Card } from '@/shared/ui/Card'

type TaskCompletionTrendChartProps = {
  enabled: boolean
  scope?: TaskStatsScope
  title?: string
}

export function TaskCompletionTrendChart({
  enabled,
  scope = 'mine',
  title = 'Task completion',
}: TaskCompletionTrendChartProps) {
  const progress = useQuery({
    queryKey: queryKeys.tasks.progress(scope),
    queryFn: () => tasksApi.getProgress(scope),
    enabled,
  })

  const chartData = useMemo(
    () =>
      (progress.data ?? []).map((point) => ({
        label: point.month,
        completed: point.completed,
      })),
    [progress.data],
  )

  const hasData = chartData.some((d) => d.completed > 0)

  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">{title}</h3>
        <span className="text-xs font-semibold text-text-muted">Last 6 months</span>
      </div>
      {progress.isLoading ? (
        <ComingSoonState
          className="flex-1"
          title="Loading tasks…"
          description="Fetching completion trend."
          minHeight="min-h-0"
        />
      ) : !hasData ? (
        <ComingSoonState
          className="flex-1"
          title="No completions yet"
          description="Task completion trend will show once work is finished."
          minHeight="min-h-0"
        />
      ) : (
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis hide allowDecimals={false} />
              <Tooltip
                formatter={(value) => [Number(value ?? 0), 'Completed']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#7C3AED' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
