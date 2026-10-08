import type { LeaveTypeFormValues } from '@/features/leave/model/schemas'
import type {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveStats,
  LeaveType,
} from '@/features/leave/model/types'
import type { EmployeeLeaveSummary } from '@/features/employees/model/types'
import { apiClient } from '@/shared/api/axios'

export type ListLeaveRequestsParams = {
  page?: number
  limit?: number
  search?: string
  leaveTypeId?: string
  /** `pending` = actionable only; `overdue` = past-dated pending. */
  status?: LeaveRequestStatus | 'overdue'
  month?: string
  scope?: 'mine' | 'team' | 'company'
}

export type ListLeaveRequestsResult = {
  requests: LeaveRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CreateLeaveRequestPayload = {
  leaveTypeId: string
  reason: string
  startDate: string
  endDate: string
}

function toLeaveTypePayload(values: LeaveTypeFormValues) {
  return {
    name: values.name.trim(),
    maxDays: values.unlimited ? null : values.maxDays,
    unlimited: values.unlimited ?? false,
    description: values.description.trim(),
    carryForward: values.carryForward,
    paidLeave: values.paidLeave,
    status: values.status,
  }
}

export const leaveApi = {
  async listRequests(params?: ListLeaveRequestsParams): Promise<LeaveRequest[]> {
    const { data } = await apiClient.get<ListLeaveRequestsResult>('/leaves/requests', {
      params: { limit: 100, ...params },
    })
    return data.requests
  },

  async listRequestsPaginated(
    params?: ListLeaveRequestsParams,
  ): Promise<ListLeaveRequestsResult> {
    const { data } = await apiClient.get<ListLeaveRequestsResult>('/leaves/requests', {
      params,
    })
    return data
  },

  async getRequestStats(scope?: 'mine' | 'team' | 'company'): Promise<LeaveStats> {
    const { data } = await apiClient.get<{ stats: LeaveStats }>('/leaves/requests/stats', {
      params: scope ? { scope } : undefined,
    })
    return {
      ...data.stats,
      overdue: data.stats.overdue ?? 0,
      currentlyOnLeave: data.stats.currentlyOnLeave ?? 0,
    }
  },

  async getRequestById(id: string): Promise<LeaveRequest | null> {
    try {
      const { data } = await apiClient.get<{ request: LeaveRequest }>(`/leaves/requests/${id}`)
      return data.request
    } catch {
      return null
    }
  },

  async createRequest(payload: CreateLeaveRequestPayload): Promise<LeaveRequest> {
    const { data } = await apiClient.post<{ request: LeaveRequest }>('/leaves/requests', payload)
    return data.request
  },

  async updateRequestStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminComment?: string,
    excessDisposition?: 'waived' | 'unpaid_deduct' | 'none',
  ): Promise<LeaveRequest> {
    const { data } = await apiClient.patch<{ request: LeaveRequest }>(
      `/leaves/requests/${id}/status`,
      { status, adminComment, excessDisposition },
    )
    return data.request
  },

  async runEncashment(payload: {
    year: number
    targetMonth?: number
    targetYear?: number
  }): Promise<{ created: number; skipped: number; year: number }> {
    const { data } = await apiClient.post<{
      created: number
      skipped: number
      year: number
    }>('/leaves/encashment', payload)
    return data
  },

  async listTypes(): Promise<LeaveType[]> {
    const { data } = await apiClient.get<{ types: LeaveType[] }>('/leaves/types')
    return data.types
  },

  async getTypeById(id: string): Promise<LeaveType | null> {
    try {
      const { data } = await apiClient.get<{ type: LeaveType }>(`/leaves/types/${id}`)
      return data.type
    } catch {
      return null
    }
  },

  async createType(values: LeaveTypeFormValues): Promise<LeaveType> {
    const { data } = await apiClient.post<{ type: LeaveType }>(
      '/leaves/types',
      toLeaveTypePayload(values),
    )
    return data.type
  },

  async updateType(id: string, values: LeaveTypeFormValues): Promise<LeaveType> {
    const { data } = await apiClient.patch<{ type: LeaveType }>(
      `/leaves/types/${id}`,
      toLeaveTypePayload(values),
    )
    return data.type
  },

  async removeType(id: string): Promise<void> {
    await apiClient.delete(`/leaves/types/${id}`)
  },

  async getEmployeeSummary(userId: string): Promise<EmployeeLeaveSummary> {
    const { data } = await apiClient.get<{ summary: EmployeeLeaveSummary }>(
      `/leaves/employees/${userId}/summary`,
    )
    return data.summary
  },
}
