import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { Card } from '@/shared/ui/Card'

function createTrendBar(highlightMonth: string | undefined) {
  return function TrendBar(props: BarShapeProps) {
    const fill =
      props.payload?.month === highlightMonth
        ? 'var(--color-primary)'
        : 'var(--color-surface-muted)'
    return <Rectangle {...props} fill={fill} radius={[6, 6, 0, 0]} />
  }
}

type PerformanceTrendChartProps = {
  data: { month: string; rating: number; score?: number }[]
  title?: string
  /** Shorter card for hub/overview placement */
  compact?: boolean
  actionTo?: string
  actionLabel?: string
}

export function PerformanceTrendChart({
  data,
  title = 'Performance Trend',
  compact = false,
  actionTo,
  actionLabel = 'Open performance',
}: PerformanceTrendChartProps) {
  const useScoreScale = data.some((d) => (d.score ?? 0) > 0)
  const chartData = data.map((item) => ({
    ...item,
    value:
      item.score && item.score > 0
        ? item.score
        : useScoreScale
          ? item.rating * 20
          : item.rating,
  }))
  const highlightMonth = chartData.reduce<{ month: string; value: number } | null>((best, item) => {
    if (item.value <= 0) return best
    if (!best || item.value > best.value) return item
    return best
  }, null)?.month

  const TrendBar = createTrendBar(highlightMonth)
  const chartHeight = compact ? 180 : 240

  return (
    <Card
      className={
        compact
          ? 'flex min-h-[260px] flex-col p-4 sm:p-5'
          : 'flex min-h-[300px] flex-col p-4 sm:min-h-[320px] sm:p-[25px]'
      }
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-base font-bold text-heading sm:text-lg">{title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {chartData.length > 0 && !chartData.every((d) => d.value === 0) ? (
            <span className="rounded-full bg-primary-muted px-3 py-1 text-xs font-semibold text-primary">
              {compact ? '6 mo' : 'MONTHLY'}
            </span>
          ) : null}
          {actionTo ? (
            <Link to={actionTo} className="text-xs font-semibold text-primary hover:opacity-90">
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {chartData.length === 0 || chartData.every((d) => d.value === 0) ? (
          <ComingSoonState
            title="No trend yet"
            description="Performance trends will show up here once reviews are available."
            minHeight={compact ? 'min-h-[160px]' : 'min-h-[240px]'}
          />
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis hide domain={[0, useScoreScale ? 100 : 5]} />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-border-card bg-surface px-3 py-2 text-sm font-semibold text-heading shadow-sm">
                      {payload[0]?.value} {useScoreScale ? 'KPI' : 'rating'}
                    </div>
                  )
                }}
              />
              <Bar dataKey="value" maxBarSize={compact ? 32 : 40} shape={TrendBar}>
                <LabelList
                  dataKey="value"
                  position="top"
                  content={({ x, y, width, value, index }) => {
                    const month = chartData[index ?? 0]?.month
                    if (month !== highlightMonth || value == null || Number(value) === 0) return null
                    const cx = Number(x ?? 0) + Number(width ?? 0) / 2
                    return (
                      <text
                        x={cx}
                        y={Number(y ?? 0) - 8}
                        textAnchor="middle"
                        className="fill-primary text-xs font-bold"
                      >
                        {value}
                      </text>
                    )
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
