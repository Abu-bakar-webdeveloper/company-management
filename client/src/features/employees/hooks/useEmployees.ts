import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { employeesApi } from '@/features/employees/api/employeesApi'
import type { ListEmployeesParams } from '@/features/employees/api/usersApi'
import type { EmployeeCreateFormValues, EmployeeFormValues } from '@/features/employees/model/schemas'
import { useCustomRoles } from '@/features/settings/hooks/useCustomRoles'
import { queryKeys } from '@/shared/api/queryKeys'

export function useEmployeesList(params: Omit<ListEmployeesParams, 'staffScope'>) {
  const { user } = useAuth()
  const staffScope = user?.role === 'admin' ? 'all' : 'employees'
  const canRead = Boolean(user && userHasPermission(user, 'employees:read'))

  return useQuery({
    queryKey: queryKeys.employees.list({ ...params, staffScope }),
    queryFn: () => employeesApi.listPaginated({ ...params, staffScope }),
    enabled: canRead,
  })
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.employees.detail(id ?? ''),
    queryFn: () => employeesApi.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  const { customRoles } = useCustomRoles()

  return useMutation({
    mutationFn: (values: EmployeeCreateFormValues | EmployeeFormValues) =>
      employeesApi.create(values, customRoles),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.employees.detail(result.employee.id), result.employee)
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
      if (import.meta.env.DEV && result.devInviteToken) {
        console.info('[dev] Employee invite token:', result.devInviteToken)
      }
    },
  })
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient()
  const { customRoles } = useCustomRoles()

  return useMutation({
    mutationFn: (values: EmployeeFormValues) => employeesApi.update(id, values, customRoles),
    onSuccess: (employee) => {
      queryClient.setQueryData(queryKeys.employees.detail(id), employee)
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (employeeId: string) => employeesApi.remove(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
    },
  })
}

export function useResendEmployeeInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (employeeId: string) => employeesApi.resendInvite(employeeId),
    onSuccess: (_result, employeeId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(employeeId) })
      if (import.meta.env.DEV && _result.devInviteToken) {
        console.info('[dev] Employee invite token:', _result.devInviteToken)
      }
    },
  })
}
