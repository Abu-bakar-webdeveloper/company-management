import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import type { StaffRole } from '@/features/auth/lib/staff-roles'
import type { Permission } from '@/features/auth/model/permissions'
import {
  apiRoleToCustomRole,
  createCustomRolePayload,
} from '@/features/settings/lib/role-permissions'
import { rolesApi } from '@/shared/api/rolesApi'
import { queryKeys } from '@/shared/api/queryKeys'

export function useCustomRoles() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const enabled = user?.role === 'admin'

  const query = useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: async () => {
      const roles = await rolesApi.list()
      return roles.map(apiRoleToCustomRole)
    },
    enabled,
  })

  const createMutation = useMutation({
    mutationFn: rolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: rolesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all })
    },
  })

  const createRole = async (
    name: string,
    baseRole: StaffRole,
    permissions: Permission[],
  ) => {
    const payload = createCustomRolePayload(name, baseRole, permissions)
    const created = await createMutation.mutateAsync({
      name: payload.name,
      description: payload.description,
      baseRole: payload.baseRole,
      permissions: payload.permissions,
    })
    return apiRoleToCustomRole(created)
  }

  const deleteRole = async (roleId: string) => {
    await deleteMutation.mutateAsync(roleId)
  }

  return {
    customRoles: query.data ?? [],
    isLoading: query.isLoading,
    createRole,
    deleteRole,
    refresh: () => query.refetch(),
    canManageCustomRoles: enabled,
    isSaving: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
