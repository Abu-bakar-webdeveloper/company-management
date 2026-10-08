import { apiClient } from '@/shared/api/axios'
import type { ExpenseFormValues } from '@/features/expenses/model/schemas'
import type { Expense, ExpenseStats } from '@/features/expenses/model/types'

type ListResult = {
  expenses: Expense[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type ExpenseListParams = {
  page?: number
  limit?: number
  search?: string
  expenseType?: string
  category?: string
  status?: string
  employeeId?: string
  projectId?: string
  period?: 'all' | 'this_month' | 'last_month'
}

export type ExpenseReceiptPayload = {
  url: string
  publicId?: string
  filename: string
  size: string
  mimeType: string
}

export type CreateExpensePayload = ExpenseFormValues & {
  receipt?: ExpenseReceiptPayload
}

export type UpdateExpensePayload = Omit<
  ExpenseFormValues,
  | 'status'
  | 'employeeId'
  | 'projectId'
  | 'billingPeriodMonth'
  | 'billingPeriodYear'
  | 'eventName'
  | 'eventDate'
> & {
  employeeId?: string | null
  projectId?: string | null
  billingPeriodMonth?: number | null
  billingPeriodYear?: number | null
  eventName?: string | null
  eventDate?: string | null
  receipt?: ExpenseReceiptPayload | null
}

export const expensesApi = {
  async list(params?: ExpenseListParams): Promise<Expense[]> {
    const { data } = await apiClient.get<ListResult>('/expenses', {
      params: { limit: 100, ...params },
    })
    return data.expenses
  },

  async listPaginated(params?: ExpenseListParams): Promise<ListResult> {
    const { data } = await apiClient.get<ListResult>('/expenses', { params })
    return data
  },

  async getStats(): Promise<ExpenseStats> {
    const { data } = await apiClient.get<{ stats: ExpenseStats }>('/expenses/stats')
    return data.stats
  },

  async getById(id: string): Promise<Expense> {
    const { data } = await apiClient.get<{ expense: Expense }>(`/expenses/${id}`)
    return data.expense
  },

  async create(payload: CreateExpensePayload): Promise<Expense> {
    const { data } = await apiClient.post<{ expense: Expense }>('/expenses', payload)
    return data.expense
  },

  async update(id: string, payload: UpdateExpensePayload): Promise<Expense> {
    const { status: _status, ...body } = payload as UpdateExpensePayload & { status?: string }
    void _status
    const { data } = await apiClient.patch<{ expense: Expense }>(`/expenses/${id}`, body)
    return data.expense
  },

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    note?: string,
  ): Promise<Expense> {
    const { data } = await apiClient.patch<{ expense: Expense }>(`/expenses/${id}/status`, {
      status,
      ...(note ? { note } : {}),
    })
    return data.expense
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`)
  },

  async getApprovedTotal(params: {
    employeeId: string
    month: number
    year: number
  }): Promise<{ total: number; count: number }> {
    const { data } = await apiClient.get<{ total: number; count: number }>(
      '/expenses/approved-total',
      { params },
    )
    return data
  },
}
