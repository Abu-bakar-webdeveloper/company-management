import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'

type ChartDataPoint = Record<string, string | number>

type WorkProgressChartProps = {
  title?: string
  subtitle?: string
  data?: ChartDataPoint[]
  dataKey?: string
  valueLabel?: string
  trend?: string
  isLoading?: boolean
}

export function WorkProgressChart({
  title = 'Work Progress',
  subtitle = 'Tasks Completed (last 6 months)',
  data = [],
  dataKey = 'completed',
  valueLabel = 'tasks',
  trend,
  isLoading = false,
}: WorkProgressChartProps) {
  const hasData = data.some((row) => Number(row[dataKey] ?? 0) > 0)
  const maxVal = Math.max(1, ...data.map((row) => Number(row[dataKey] ?? 0)))
  const yMax = Math.ceil(maxVal / 5) * 5 || 5

  return (
    <div className="flex min-h-[320px] flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:min-h-[358px] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold leading-6 text-[#1E293B] sm:text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
        </div>
        {trend && hasData ? (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#ECFDF5] px-4 py-1 text-sm font-semibold text-[#00B67A]">
            {trend}
          </span>
        ) : null}
      </div>

      <div className="mt-4 min-h-0 flex-1 sm:mt-6">
        {isLoading ? (
          <ComingSoonState
            title="Loading progress…"
            description="Fetching your recent task completion trends."
            compact
            minHeight="min-h-[220px]"
          />
        ) : !hasData ? (
          <ComingSoonState
            title="No progress yet"
            description="Progress will show up here once tasks are completed."
            minHeight="min-h-[220px]"
          />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                width={28}
                domain={[0, yMax]}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E2E8F0',
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} ${valueLabel}`, 'Total']}
              />
              <Bar dataKey={dataKey} fill="#1877F2" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
