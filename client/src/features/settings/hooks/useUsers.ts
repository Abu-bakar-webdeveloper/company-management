import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  mapAuthUserToManagedUser,
} from '@/features/settings/lib/user-mappers'
import type { UserFormValues } from '@/features/settings/model/types'
import { usersApi, type ListUsersParams } from '@/shared/api/usersApi'
import { queryKeys } from '@/shared/api/queryKeys'
import { useCustomRoles } from '@/features/settings/hooks/useCustomRoles'

export function useUsersList(params: ListUsersParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const result = await usersApi.list(params)
      return {
        users: result.users.map(mapAuthUserToManagedUser),
        pagination: result.pagination,
      }
    },
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  const { customRoles } = useCustomRoles()

  return useMutation({
    mutationFn: (values: UserFormValues) =>
      usersApi.create(formValuesToCreatePayload(values, customRoles)),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
      if (import.meta.env.DEV && result.devInviteToken) {
        console.info('[dev] User invite token:', result.devInviteToken)
      }
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) =>
      usersApi.update(id, formValuesToUpdatePayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all })
    },
  })
}

export function useResendUserInvite() {
  return useMutation({
    mutationFn: (userId: string) => usersApi.resendInvite(userId),
    onSuccess: (result) => {
      if (import.meta.env.DEV && result.devInviteToken) {
        console.info('[dev] User invite token:', result.devInviteToken)
      }
    },
  })
}
