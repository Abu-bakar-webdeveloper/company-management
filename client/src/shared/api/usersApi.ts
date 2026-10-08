import type { AuthUser } from '@/features/auth/model/types'
import { apiClient } from '@/shared/api/axios'

export type ListUsersParams = {
  page?: number
  limit?: number
  role?: 'manager' | 'hr' | 'employee'
  status?: 'active' | 'pending' | 'suspended'
  search?: string
}

export type ListUsersResult = {
  users: AuthUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CreateUserPayload = {
  firstName?: string
  lastName?: string
  fullName?: string
  email: string
  phone?: string
  cnic?: string
  role: 'manager' | 'hr' | 'employee'
  customRoleId?: string
  managerId?: string
  department?: string
  jobTitle?: string
  homeAddress?: string
  joinDate?: string
  sendInviteEmail?: boolean
  avatar?: string
  basicSalary?: number
  hra?: number
  utilityAllowance?: number
  conveyanceAllowance?: number
  providentFund?: number
  bankName?: string
  bankAccountNo?: string
  employmentStage?: 'probation' | 'permanent'
  probationEndDate?: string
  confirmationDate?: string
}

export type UpdateUserPayload = {
  firstName?: string
  lastName?: string
  fullName?: string
  phone?: string
  cnic?: string
  department?: string
  jobTitle?: string
  homeAddress?: string
  joinDate?: string
  status?: 'active' | 'pending' | 'suspended'
  role?: 'manager' | 'hr' | 'employee'
  customRoleId?: string | null
  managerId?: string | null
  avatar?: string
  basicSalary?: number
  hra?: number
  utilityAllowance?: number
  conveyanceAllowance?: number
  providentFund?: number
  bankName?: string
  bankAccountNo?: string
  employmentStage?: 'probation' | 'permanent'
  probationEndDate?: string | null
  confirmationDate?: string | null
}

export type CreateUserResult = {
  user: AuthUser
  devInviteToken?: string
}

export type ListEmployeesParams = ListUsersParams & {
  /** When `employees`, only users with role employee. When `all`, returns all staff the actor can manage. */
  staffScope?: 'all' | 'employees'
}

export const usersApi = {
  async list(params?: ListUsersParams): Promise<ListUsersResult> {
    const { data } = await apiClient.get<ListUsersResult>('/users', { params })
    return data
  },

  async getById(id: string): Promise<AuthUser> {
    const { data } = await apiClient.get<{ user: AuthUser }>(`/users/${id}`)
    return data.user
  },

  async create(payload: CreateUserPayload): Promise<CreateUserResult> {
    const { data } = await apiClient.post<CreateUserResult>('/users', payload)
    return data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<AuthUser> {
    const { data } = await apiClient.patch<{ user: AuthUser }>(`/users/${id}`, payload)
    return data.user
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },

  async resendInvite(id: string): Promise<{ devInviteToken?: string }> {
    const { data } = await apiClient.post<{ devInviteToken?: string }>(
      `/users/${id}/resend-invite`,
    )
    return data
  },

  async listManagerOptions(): Promise<AuthUser[]> {
    const { data } = await apiClient.get<{ managers: AuthUser[] }>('/users/manager-options')
    return data.managers
  },
}
