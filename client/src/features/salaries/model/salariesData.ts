import type { SalaryStatus } from '@/features/salaries/model/types'

export const statusLabels: Record<SalaryStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  on_hold: 'On Hold',
}

export const departmentOptions = [
  'Engineering',
  'Design',
  'Marketing',
  'Hr',
  'Finance',
  'Operations',
] as const

export const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
] as const

export const emptyEarnings = {
  basic: 0,
  hra: 0,
  utilityAllowance: 0,
  conveyanceAllowance: 0,
  reimburse: 0,
  overTime: 0,
  bonus: 0,
  loanIssued: 0,
  leaveEncashment: 0,
}

export const emptyDeductions = {
  leave: 0,
  loan: 0,
  providentFund: 0,
  advance: 0,
  incomeTax: 0,
  other: 0,
}
