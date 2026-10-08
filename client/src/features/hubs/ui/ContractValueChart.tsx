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
import { formatCompanyMoney } from '@/shared/lib/format'
import { Card } from '@/shared/ui/Card'

type ContractValueChartProps = {
  rows: Array<{ id: string; name: string; totalContractValue: number }>
}

export function ContractValueChart({ rows }: ContractValueChartProps) {
  const data = rows.slice(0, 6).map((row) => ({
    name: row.name.length > 14 ? `${row.name.slice(0, 12)}…` : row.name,
    fullName: row.name,
    value: row.totalContractValue,
  }))

  return (
    <Card className="flex min-h-[300px] flex-col p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-heading sm:text-lg">Contract value by client</h3>
        <span className="text-xs font-semibold text-text-muted">Top clients</span>
      </div>
      {data.length === 0 || data.every((d) => d.value === 0) ? (
        <ComingSoonState
          className="flex-1"
          title="No contract value yet"
          description="Client contract totals will show once projects have values."
          minHeight="min-h-0"
        />
      ) : (
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [formatCompanyMoney(Number(value ?? 0)), 'Contract']}
                labelFormatter={(_, payload) =>
                  String(payload?.[0]?.payload?.fullName ?? '')
                }
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0' }}
              />
              <Bar dataKey="value" fill="#00B67A" radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
