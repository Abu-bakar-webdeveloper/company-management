import type { Permission } from '@/features/auth/model/permissions'
import type { CustomRole } from '@/features/settings/model/types'
import { apiClient } from '@/shared/api/axios'

export type CompanyRoleDto = {
  id: string
  name: string
  description: string
  baseRole: 'manager' | 'hr' | 'employee'
  permissions: Permission[]
  userCount: number
  isLocked: boolean
  createdAt: string
}

export type CreateCompanyRolePayload = {
  name: string
  description?: string
  baseRole: 'manager' | 'hr' | 'employee'
  permissions: Permission[]
}

export type UpdateCompanyRolePayload = {
  name?: string
  description?: string
  permissions?: Permission[]
  isLocked?: boolean
}

export const rolesApi = {
  async list(): Promise<CompanyRoleDto[]> {
    const { data } = await apiClient.get<{ roles: CompanyRoleDto[] }>('/roles')
    return data.roles
  },

  async create(payload: CreateCompanyRolePayload): Promise<CompanyRoleDto> {
    const { data } = await apiClient.post<{ role: CompanyRoleDto }>('/roles', payload)
    return data.role
  },

  async update(id: string, payload: UpdateCompanyRolePayload): Promise<CompanyRoleDto> {
    const { data } = await apiClient.patch<{ role: CompanyRoleDto }>(`/roles/${id}`, payload)
    return data.role
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`)
  },
}

export type { CustomRole }
