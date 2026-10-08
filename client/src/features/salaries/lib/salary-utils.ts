import type {
  Salary,
  SalaryListFilters,
  SalaryStats,
  SalaryStatus,
} from '@/features/salaries/model/types'
import {
  formatCompanyDateTime,
  formatCompanyLongDate,
  formatCompanyMoney,
  formatCompanyShortDate,
} from '@/shared/lib/format'

export function formatCurrency(amount: number): string {
  return formatCompanyMoney(amount)
}

export function formatSalaryDate(iso: string): string {
  return formatCompanyShortDate(iso)
}

export function formatSalaryLongDate(iso: string): string {
  return formatCompanyLongDate(iso)
}

export function formatActivityTimestamp(iso: string): string {
  return formatCompanyDateTime(iso)
}

export function filterSalaries(items: Salary[], filters: SalaryListFilters): Salary[] {
  const q = filters.search.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch =
      !q ||
      item.employeeName.toLowerCase().includes(q) ||
      item.employeeCode.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q)

    const matchesDepartment =
      filters.department === 'all' ||
      item.department.toLowerCase() === filters.department.toLowerCase()
    const matchesStatus = filters.status === 'all' || item.status === filters.status
    const matchesMonth = filters.month === 'all' || item.payPeriodMonth === filters.month
    const matchesYear = filters.year === 'all' || item.payPeriodYear === filters.year
    const matchesEmployee =
      filters.employeeId === 'all' || item.employeeId === filters.employeeId

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesStatus &&
      matchesMonth &&
      matchesYear &&
      matchesEmployee
    )
  })
}

function sumNetByStatus(salaries: Salary[], status: SalaryStatus): number {
  return salaries.filter((s) => s.status === status).reduce((acc, s) => acc + s.net, 0)
}

export function computeSalaryStats(salaries: Salary[]): SalaryStats {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const paidThisMonth = salaries
    .filter((s) => {
      if (s.status !== 'paid') return false
      const date = new Date(s.date)
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear
    })
    .reduce((acc, s) => acc + s.net, 0)

  return {
    totalMonthlyPayroll: salaries.reduce((acc, s) => acc + s.net, 0),
    pendingPayroll: sumNetByStatus(salaries, 'pending'),
    paidThisMonth,
    unpaidOnHold: sumNetByStatus(salaries, 'on_hold'),
  }
}
