import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasAnyPermission, userHasPermission } from '@/features/auth/model/permissions'
import { expensesApi } from '@/features/expenses/api/expensesApi'
import { formatCurrency, formatExpenseDate } from '@/features/expenses/lib/expense-utils'
import { ComingSoonState } from '@/features/dashboard/ui/ComingSoonState'
import { ExpenseSummaryChart } from '@/features/dashboard/ui/ExpenseSummaryChart'
import { ExpenseStatusBadge } from '@/features/expenses/ui/ExpenseStatusBadge'
import { HubBreakdownCard } from '@/features/hubs/ui/HubBreakdownCard'
import { HubDecisionCard } from '@/features/hubs/ui/HubDecisionCard'
// import { HubModulesGrid } from '@/features/hubs/ui/HubModulesGrid'
import { HubPageHeader } from '@/features/hubs/ui/HubPageHeader'
import { HubPageSkeleton } from '@/features/hubs/ui/HubPageSkeleton'
import { HubStatsRow, type HubStatCard } from '@/features/hubs/ui/HubStatsRow'
import {
  HubCheckIcon,
  HubClockIcon,
  HubMoneyIcon,
  HubWarningIcon,
} from '@/features/hubs/ui/hubIcons'
import { PayrollTrendChart } from '@/features/hubs/ui/PayrollTrendChart'
import { salariesApi } from '@/features/salaries/api/salariesApi'
import { getErrorMessage } from '@/shared/api/errors'
import { formatCompanyMoney } from '@/shared/lib/format'
import { queryKeys } from '@/shared/api/queryKeys'
import { Card } from '@/shared/ui/Card'

export function FinanceHubPage() {
  const { user } = useAuth()

  const canSalaries = Boolean(user && userHasPermission(user, 'salaries:read'))
  const canExpenses = Boolean(user && userHasPermission(user, 'expenses:read'))
  const canSelfSalary = Boolean(
    user && !canSalaries && userHasAnyPermission(user, ['salaries:self', 'salaries:read']),
  )

  const salaryStats = useQuery({
    queryKey: ['salaries', 'hub-stats'],
    queryFn: () => salariesApi.getStats(),
    enabled: canSalaries,
  })

  const expenseStats = useQuery({
    queryKey: queryKeys.expenses.stats(),
    queryFn: () => expensesApi.getStats(),
    enabled: canExpenses,
  })

  const recentExpenses = useQuery({
    queryKey: queryKeys.expenses.list({ limit: 8 }),
    queryFn: () => expensesApi.list({ limit: 8 }),
    enabled: canExpenses,
  })

  const loading =
    (canSalaries && salaryStats.isLoading) ||
    (canExpenses && (expenseStats.isLoading || recentExpenses.isLoading))

  const stats = useMemo((): HubStatCard[] => {
    const cards: HubStatCard[] = []
    const salary = salaryStats.data
    const expense = expenseStats.data

    if (canSalaries && salary) {
      cards.push(
        {
          id: 'payroll',
          label: 'Monthly payroll',
          value: formatCompanyMoney(salary.totalMonthlyPayroll),
          hint: `${formatCompanyMoney(salary.paidThisMonth)} paid this month`,
          hintClass: 'text-[#00B67A]',
          icon: <HubMoneyIcon />,
          iconBg: 'bg-[#ECFDF5] text-[#00B67A]',
          border: 'border-[#A7F3D0]',
        },
        {
          id: 'pendingPayroll',
          label: 'Pending payroll',
          value: formatCompanyMoney(salary.pendingPayroll),
          hint:
            salary.pendingPayroll > 0 ? 'Needs payroll processing' : 'All payroll settled',
          hintClass: salary.pendingPayroll > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
          icon: <HubClockIcon />,
          iconBg: 'bg-[#FFF7ED] text-[#F59E0B]',
          border: 'border-[#FDE68A]',
        },
      )
    } else if (canSelfSalary) {
      cards.push({
        id: 'mySalary',
        label: 'My salary',
        value: 'Ready',
        hint: 'Open My Salary for details',
        hintClass: 'text-primary',
        icon: <HubMoneyIcon />,
        iconBg: 'bg-[#EFF6FF] text-primary',
        border: 'border-primary-muted',
      })
    }

    if (canExpenses && expense) {
      cards.push(
        {
          id: 'pendingExpenses',
          label: 'Pending expenses',
          value: formatCompanyMoney(expense.pending),
          hint:
            expense.pending > 0 ? 'Needs review / approval' : 'No pending claims',
          hintClass: expense.pending > 0 ? 'text-[#D97706]' : 'text-[#00B67A]',
          icon: <HubWarningIcon />,
          iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
          border: 'border-[#DC262633]',
        },
        {
          id: 'approvedExpenses',
          label: 'Approved expenses',
          value: formatCompanyMoney(expense.approved),
          hint: `${expense.count ?? 0} total claims`,
          hintClass: 'text-primary',
          icon: <HubCheckIcon />,
          iconBg: 'bg-[#EFF6FF] text-primary',
          border: 'border-primary-muted',
        },
      )
    }

    return cards.slice(0, 4)
  }, [canSalaries, canSelfSalary, canExpenses, salaryStats.data, expenseStats.data])

  const expenseBreakdown = useMemo(() => {
    const expense = expenseStats.data
    if (!expense) return []
    const total = Math.max(expense.total, 1)
    return [
      {
        id: 'pending',
        label: 'Pending',
        value: formatCompanyMoney(expense.pending),
        percent: (expense.pending / total) * 100,
        color: '#F59E0B',
      },
      {
        id: 'approved',
        label: 'Approved',
        value: formatCompanyMoney(expense.approved),
        percent: (expense.approved / total) * 100,
        color: '#00B67A',
      },
      {
        id: 'rejected',
        label: 'Rejected',
        value: formatCompanyMoney(expense.rejected),
        percent: (expense.rejected / total) * 100,
        color: '#DC2626',
      },
    ]
  }, [expenseStats.data])

  const salaryDepartmentBreakdown = useMemo(() => {
    const rows = salaryStats.data?.byDepartment ?? []
    if (rows.length === 0) return []
    const total = Math.max(
      rows.reduce((sum, row) => sum + row.total, 0),
      1,
    )
    const colors = ['#1877F2', '#00B67A', '#7C3AED', '#F59E0B', '#0EA5E9', '#DC2626']
    return rows.map((row, index) => ({
      id: row.department,
      label: row.department,
      value: formatCompanyMoney(row.total),
      percent: (row.total / total) * 100,
      color: colors[index % colors.length],
    }))
  }, [salaryStats.data])

  const pendingExpenseItems = useMemo(
    () =>
      (recentExpenses.data ?? [])
        .filter((e) => e.status === 'pending')
        .slice(0, 5)
        .map((expense) => ({
          id: expense.id,
          title: expense.title,
          subtitle: `${expense.employeeName ?? '—'} · ${formatExpenseDate(expense.date)}`,
          meta: formatCurrency(expense.amount),
          metaClass: 'text-sm font-bold text-[#D97706]',
          badge: <ExpenseStatusBadge status={expense.status} />,
          href: `/expenses/${expense.id}`,
          avatarName: expense.employeeName,
          avatarUrl: expense.employeeAvatar,
        })),
    [recentExpenses.data],
  )

  const recentApprovedItems = useMemo(
    () =>
      (recentExpenses.data ?? [])
        .filter((e) => e.status === 'approved')
        .slice(0, 5)
        .map((expense) => ({
          id: expense.id,
          title: expense.title,
          subtitle: `${expense.employeeName ?? '—'} · ${formatExpenseDate(expense.date)}`,
          meta: formatCurrency(expense.amount),
          metaClass: 'text-sm font-bold text-[#00B67A]',
          badge: <ExpenseStatusBadge status={expense.status} />,
          href: `/expenses/${expense.id}`,
          avatarName: expense.employeeName,
          avatarUrl: expense.employeeAvatar,
        })),
    [recentExpenses.data],
  )

  if (loading && (canSalaries || canExpenses)) return <HubPageSkeleton />

  const error =
    salaryStats.isError || expenseStats.isError
      ? getErrorMessage(
          salaryStats.error ?? expenseStats.error,
          'Some finance data could not be loaded.',
        )
      : null

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <HubPageHeader
        title="Payroll"
        subtitle="Payroll posture and expense decisions that need attention."
      />

      {/* <HubModulesGrid modules={modules} /> */}

      {error ? (
        <Card className="mb-6 border-[#FDE68A] bg-[#FFFBEB] px-4 py-3 text-sm text-[#92400E]">
          {error}
        </Card>
      ) : null}

      <HubStatsRow cards={stats} />

      <div className="flex flex-col gap-4 sm:gap-6">
        {(canExpenses || canSalaries) && (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            {canExpenses ? <ExpenseSummaryChart /> : null}
            {canExpenses ? (
              <HubBreakdownCard
                title="Expense status"
                items={expenseBreakdown}
                empty="No expenses yet"
                emptyDescription="Expense status will show up here once claims are submitted."
                actionTo="/expenses"
                actionLabel="Open expenses"
              />
            ) : canSalaries ? (
              <HubBreakdownCard
                title="Payroll snapshot"
                items={
                  salaryStats.data
                    ? [
                        {
                          id: 'paid',
                          label: 'Paid this month',
                          value: formatCompanyMoney(salaryStats.data.paidThisMonth),
                          percent: 100,
                          color: '#00B67A',
                        },
                        {
                          id: 'pending',
                          label: 'Pending',
                          value: formatCompanyMoney(salaryStats.data.pendingPayroll),
                          percent:
                            salaryStats.data.totalMonthlyPayroll > 0
                              ? (salaryStats.data.pendingPayroll /
                                  salaryStats.data.totalMonthlyPayroll) *
                                100
                              : 0,
                          color: '#F59E0B',
                        },
                        {
                          id: 'hold',
                          label: 'Unpaid / on hold',
                          value: formatCompanyMoney(salaryStats.data.unpaidOnHold),
                          percent:
                            salaryStats.data.totalMonthlyPayroll > 0
                              ? (salaryStats.data.unpaidOnHold /
                                  salaryStats.data.totalMonthlyPayroll) *
                                100
                              : 0,
                          color: '#DC2626',
                        },
                      ]
                    : []
                }
                empty="No payroll yet"
                emptyDescription="Payroll snapshot will show up here once salaries are processed."
                actionTo="/salaries"
                actionLabel="Open salaries"
              />
            ) : null}
          </div>
        )}

        {canExpenses ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
            <HubDecisionCard
              title="Needs approval"
              empty="No pending expenses"
              emptyDescription="Expense claims waiting for review will show up here."
              items={pendingExpenseItems}
              actionTo="/expenses"
            />
            <HubDecisionCard
              title="Recently approved"
              empty="No approved expenses yet"
              emptyDescription="Recently approved expense claims will show up here."
              items={recentApprovedItems}
              actionTo="/expenses"
            />
          </div>
        ) : canSelfSalary ? (
          <Card className="p-4 sm:p-6">
            <h3 className="mb-4 text-base font-bold text-heading sm:text-lg">My compensation</h3>
            <ComingSoonState
              title="Open My Salary"
              description="View your salary slips and payment history from My Salary."
              minHeight="min-h-[180px]"
              compact
            />
            <Link
              to="/my-salary"
              className="mt-4 inline-block text-sm font-semibold text-primary hover:opacity-90"
            >
              Open My Salary
            </Link>
          </Card>
        ) : null}

        {canSalaries ? (
          <section aria-label="Payroll insights">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
              Insights
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <PayrollTrendChart />
              <HubBreakdownCard
                title="Salary by department"
                items={salaryDepartmentBreakdown}
                empty="No department payroll yet"
                actionTo="/salaries"
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
