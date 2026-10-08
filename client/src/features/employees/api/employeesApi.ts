import {
  formValuesToCreatePayload,
  formValuesToUpdatePayloadWithPhoto,
  mapAuthUserToEmployee,
} from '@/features/employees/lib/employee-mappers'
import type { EmployeeCreateFormValues, EmployeeFormValues } from '@/features/employees/model/schemas'
import type { CustomRole } from '@/features/settings/model/types'
import type { Employee } from '@/features/employees/model/types'
import {
  usersApi,
  type CreateUserResult,
  type ListEmployeesParams,
} from '@/shared/api/usersApi'

export type { ListEmployeesParams }

export const employeesApi = {
  async list(params?: ListEmployeesParams) {
    const { staffScope = 'employees', ...query } = params ?? {}
    const result = await usersApi.list({
      ...query,
      ...(staffScope === 'employees' ? { role: 'employee' as const } : {}),
    })
    return result.users.map((user) => mapAuthUserToEmployee(user))
  },

  async listPaginated(params?: ListEmployeesParams) {
    const { staffScope = 'employees', ...query } = params ?? {}
    const result = await usersApi.list({
      ...query,
      ...(staffScope === 'employees' ? { role: 'employee' as const } : {}),
    })
    return {
      employees: result.users.map((user) => mapAuthUserToEmployee(user)),
      pagination: result.pagination,
    }
  },

  async getById(id: string): Promise<Employee | null> {
    try {
      const user = await usersApi.getById(id)
      return mapAuthUserToEmployee(user)
    } catch {
      return null
    }
  },

  async create(
    values: EmployeeCreateFormValues | EmployeeFormValues,
    customRoles: CustomRole[] = [],
  ): Promise<CreateUserResult & { employee: Employee }> {
    const payload = await formValuesToCreatePayload(values, customRoles)
    const result = await usersApi.create(payload)
    return {
      ...result,
      employee: mapAuthUserToEmployee(result.user),
    }
  },

  async update(
    id: string,
    values: EmployeeFormValues,
    customRoles: CustomRole[] = [],
  ): Promise<Employee> {
    const payload = await formValuesToUpdatePayloadWithPhoto(values, customRoles)
    const user = await usersApi.update(id, payload)
    return mapAuthUserToEmployee(user)
  },

  async remove(id: string): Promise<void> {
    await usersApi.remove(id)
  },

  async resendInvite(id: string): Promise<{ devInviteToken?: string }> {
    return usersApi.resendInvite(id)
  },
}
