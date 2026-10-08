import type { Expense, ExpenseCategory, ExpenseType } from '@/features/expenses/model/types'

export const expenseTypeLabels: Record<ExpenseType, string> = {
  monthly: 'Monthly Expense',
  event: 'Event Management',
  employee: 'Employee Expense',
  other: 'Other',
}

export const categoryLabels: Record<ExpenseCategory, string> = {
  equipment: 'Equipment',
  travel: 'Travel',
  food: 'Food',
  software: 'Software',
  office: 'Office',
  other: 'Other',
}

export const statusLabels: Record<Expense['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

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

export type ExpenseOption = { id: string; name: string; avatar?: string }
export type ProjectOption = { id: string; name: string }
