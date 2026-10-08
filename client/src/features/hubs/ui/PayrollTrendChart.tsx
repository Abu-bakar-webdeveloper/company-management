import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import { formatCompanyMoney } from '@/shared/lib/format'
import { Card } from '@/shared/ui/Card'

function lastNMonths(n: number): Array<{ month: number; year: number; label: string }> {
  const now = new Date()
  const rows: Array<{ month: number; year: number; label: string }> = []
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    rows.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: d.toLocaleString('en-US', { month: 'short' }),
    })
  }
  return rows
}

export function PayrollTrendChart({ months = 6 }: { months?: number }) {
  const periods = useMemo(() => lastNMonths(months), [months])

  const queries = useQueries({
    queries: periods.map((period) => ({
      queryKey: ['salaries', 'stats', period.year, period.month],
      queryFn: () => salariesApi.getStats({ month: period.month, year: period.year }),
    })),
  })

  const loading = queries.some((q) => q.isLoading)
  const chartData = periods.map((period, index) => ({
    month: period.label,
    total: queries[index]?.data?.totalMonthlyPayroll ?? 0,
  }))
  const hasData = chartData.some((d) => d.total > 0)

  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">Payroll trend</h3>
        <span className="text-xs font-semibold text-text-muted">Last {months} months</span>
      </div>
      {loading ? (
        <ComingSoonState
          className="flex-1"
          title="Loading payroll…"
          description="Fetching monthly payroll totals."
          minHeight="min-h-0"
        />
      ) : !hasData ? (
        <ComingSoonState
          className="flex-1"
          title="No payroll history yet"
          description="Monthly payroll totals will show once salary records exist."
          minHeight="min-h-0"
        />
      ) : (
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value) => [formatCompanyMoney(Number(value ?? 0)), 'Payroll']}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="total" fill="#1877F2" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
