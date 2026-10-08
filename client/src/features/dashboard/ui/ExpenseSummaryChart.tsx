import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { ComingSoonCard, ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import { categoryLabel } from '@/features/expenses/lib/expense-utils'
import type { ExpenseCategory } from '@/features/expenses/model/types'
import { queryKeys } from '@/shared/api/queryKeys'
import { formatCompanyMoneyCompact } from '@/shared/lib/format'
import { Card } from '@/shared/ui/Card'

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  equipment: '#1877f2',
  travel: '#00b67a',
  food: '#ff5c00',
  software: '#9333ea',
  office: '#f59e0b',
  other: '#94a3b8',
}

export function ExpenseSummaryChart() {
  const { user } = useAuth()
  const canRead = Boolean(user && userHasPermission(user, 'expenses:read'))

  const statsQuery = useQuery({
    queryKey: queryKeys.expenses.stats(),
    queryFn: () => expensesApi.getStats(),
    enabled: canRead,
  })

  const { segments, total } = useMemo(() => {
    const stats = statsQuery.data
    const totalAmount = stats?.total ?? 0
    const categories = stats?.byCategory ?? []

    if (!stats || totalAmount <= 0 || categories.length === 0) {
      return {
        segments: [] as Array<{ name: string; value: number; amount: number; color: string }>,
        total: 0,
      }
    }

    const segments = categories
      .filter((row) => row.amount > 0)
      .map((row) => ({
        name: categoryLabel(row.category),
        amount: row.amount,
        value: Math.round((row.amount / totalAmount) * 100),
        color: CATEGORY_COLORS[row.category] ?? '#94a3b8',
      }))

    const valueSum = segments.reduce((sum, s) => sum + s.value, 0)
    if (segments.length > 0 && valueSum !== 100) {
      segments[0].value += 100 - valueSum
    }

    return { segments, total: totalAmount }
  }, [statsQuery.data])

  if (!canRead) {
    return (
      <ComingSoonCard
        heading="Expense Summary"
        cardClassName="h-[358px]"
        title="Not available"
        description="You do not have permission to view expense data."
        minHeight="min-h-0 flex-1"
      />
    )
  }

  return (
    <Card className="flex h-[358px] flex-col p-[25px]">
      <h3 className="mb-6 text-[24px] font-semibold leading-6 text-heading">Expense Summary</h3>

      {statsQuery.isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">Loading expenses…</p>
        </div>
      ) : statsQuery.isError ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-danger">Unable to load expense summary.</p>
        </div>
      ) : total === 0 ? (
        <ComingSoonState
          title="No expenses yet"
          description="Add expenses to see a category breakdown here."
          minHeight="min-h-0 flex-1"
        />
      ) : (
        <div className="flex min-h-0 flex-1 items-center gap-8">
          <div className="relative h-[200px] w-[200px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: 100 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={92}
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
                  innerRadius={52}
                  outerRadius={72}
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
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8">
              <span className="max-w-[88px] text-center text-lg font-bold leading-6 text-[#0F172A]">
                {formatCompanyMoneyCompact(total)}
              </span>
              <span className="text-xs font-bold text-[#94A3B8]">Total Spent</span>
            </div>
          </div>

          <ul className="flex max-h-full flex-col gap-4 overflow-y-auto">
            {segments.map((item) => (
              <li key={item.name} className="flex items-center gap-3 text-sm text-text-muted">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>
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
