import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import type { CategoryBreakdownItem, TrendBar } from '@/features/reports/model/types'
import { MoreIcon } from '@/features/reports/ui/icons'
import { Card } from '@/shared/ui/Card'

const BAR_COLORS = ['#DBEAFE', '#BFDBFE', '#DBEAFE', '#93C5FD', '#60A5FA', '#93C5FD', '#1877F2']

export function ReportDetailCharts({
  trend,
  categories,
}: {
  trend: TrendBar[]
  categories: CategoryBreakdownItem[]
}) {
  const hasTrend = trend.some((item) => item.value > 0)
  const hasCategories = categories.some((item) => item.percent > 0)

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-heading sm:text-lg">Expense Trend</h3>
          {hasTrend ? (
            <button
              type="button"
              aria-label="More options"
              className="text-text-muted hover:text-heading"
            >
              <MoreIcon />
            </button>
          ) : null}
        </div>
        <div className="min-h-0 flex-1">
          {!hasTrend ? (
            <ComingSoonState
              title="No trend yet"
              description="Trend data will show up here once report records are available."
              minHeight="min-h-0 h-full"
            />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'rgba(24,119,242,0.04)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {trend.map((entry, index) => (
                    <Cell key={entry.month} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card className="flex min-h-[300px] flex-col p-4 sm:p-[25px]">
        <h3 className="mb-6 text-base font-bold text-heading sm:text-lg">Category Breakdown</h3>
        {!hasCategories ? (
          <ComingSoonState
            className="flex-1"
            title="No categories yet"
            description="Category breakdown will show up here once report records are available."
            minHeight="min-h-0"
          />
        ) : (
          <ul className="flex flex-1 flex-col justify-center gap-5">
            {categories.map((item) => (
              <li key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium text-heading">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-heading">{item.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
