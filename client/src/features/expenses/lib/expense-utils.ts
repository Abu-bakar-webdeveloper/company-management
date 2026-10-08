import type {
  Expense,
  ExpenseCategory,
  ExpenseListFilters,
  ExpenseStats,
  ExpenseStatus,
  ExpenseType,
} from '@/features/expenses/model/types'
import {
  formatCompanyDateTime,
  formatCompanyLongDate,
  formatCompanyMoney,
  formatCompanyShortDate,
} from '@/shared/lib/format'

export function formatCurrency(amount: number): string {
  return formatCompanyMoney(amount)
}

export function formatExpenseDate(iso: string): string {
  return formatCompanyShortDate(iso)
}

export function formatExpenseLongDate(iso: string): string {
  return formatCompanyLongDate(iso)
}

export function formatActivityTimestamp(iso: string): string {
  return formatCompanyDateTime(iso)
}

function isInPeriod(dateIso: string, period: ExpenseListFilters['period']): boolean {
  if (period === 'all') return true
  const date = new Date(dateIso)
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  if (period === 'this_month') {
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear
  }

  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
  return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
}

export function filterExpenses(items: Expense[], filters: ExpenseListFilters): Expense[] {
  const q = filters.search.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.employeeName?.toLowerCase().includes(q) ?? false) ||
      item.requestId.toLowerCase().includes(q) ||
      (item.projectName?.toLowerCase().includes(q) ?? false) ||
      (item.eventName?.toLowerCase().includes(q) ?? false)

    const matchesType =
      filters.expenseType === 'all' || item.expenseType === filters.expenseType
    const matchesCategory = filters.category === 'all' || item.category === filters.category
    const matchesStatus = filters.status === 'all' || item.status === filters.status
    const matchesPeriod = isInPeriod(item.date, filters.period)
    const matchesEmployee =
      filters.employeeId === 'all' || item.employeeId === filters.employeeId
    const matchesProject = filters.projectId === 'all' || item.projectId === filters.projectId

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesStatus &&
      matchesPeriod &&
      matchesEmployee &&
      matchesProject
    )
  })
}

export function computeExpenseStats(expenses: Expense[]): ExpenseStats {
  const sumByStatus = (status: ExpenseStatus) =>
    expenses.filter((e) => e.status === status).reduce((acc, e) => acc + e.amount, 0)

  return {
    total: expenses.reduce((acc, e) => acc + e.amount, 0),
    pending: sumByStatus('pending'),
    approved: sumByStatus('approved'),
    rejected: sumByStatus('rejected'),
  }
}

export function categoryLabel(category: ExpenseCategory): string {
  const labels: Record<ExpenseCategory, string> = {
    equipment: 'Equipment',
    travel: 'Travel',
    food: 'Food',
    software: 'Software',
    office: 'Office',
    other: 'Other',
  }
  return labels[category]
}

export function expenseTypeLabel(type: ExpenseType): string {
  const labels: Record<ExpenseType, string> = {
    monthly: 'Monthly Expense',
    event: 'Event Management',
    employee: 'Employee Expense',
    other: 'Other',
  }
  return labels[type]
}
