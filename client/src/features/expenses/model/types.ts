export type ExpenseStatus = 'pending' | 'approved' | 'rejected'

export type ExpenseType = 'monthly' | 'event' | 'employee' | 'other'

export type ExpenseCategory = 'equipment' | 'travel' | 'food' | 'software' | 'office' | 'other'

export type ExpenseActivityType = 'created' | 'reviewed' | 'approved' | 'rejected' | 'updated'

export type ExpenseActivity = {
  id: string
  type: ExpenseActivityType
  actor: string
  timestamp: string
  note?: string
}

export type ExpenseReceipt = {
  filename: string
  size: string
  type: string
  url?: string
}

export type Expense = {
  id: string
  requestId: string
  title: string
  expenseType: ExpenseType
  category: ExpenseCategory
  employeeId?: string
  employeeName?: string
  employeeAvatar?: string
  projectId?: string
  projectName?: string
  billingPeriodMonth?: number
  billingPeriodYear?: number
  eventName?: string
  eventDate?: string
  amount: number
  date: string
  status: ExpenseStatus
  description: string
  receipt?: ExpenseReceipt
  activities: ExpenseActivity[]
  projectBudgetSpent: number
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
}

export type ExpenseListFilters = {
  search: string
  expenseType: ExpenseType | 'all'
  category: ExpenseCategory | 'all'
  status: ExpenseStatus | 'all'
  period: 'all' | 'this_month' | 'last_month'
  employeeId: string | 'all'
  projectId: string | 'all'
}

export type ExpenseCategoryStat = {
  category: ExpenseCategory
  amount: number
  count: number
}

export type ExpenseStats = {
  total: number
  pending: number
  approved: number
  rejected: number
  count?: number
  byCategory?: ExpenseCategoryStat[]
}
