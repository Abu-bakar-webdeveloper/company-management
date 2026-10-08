import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/model/AuthContext'
import { userHasPermission } from '@/features/auth/model/permissions'
import { teamApi } from '@/features/team/api/teamApi'
import { queryKeys } from '@/shared/api/queryKeys'

export function useTeamMembers() {
  const { user } = useAuth()
  const canRead = Boolean(user && userHasPermission(user, 'team:read'))

  return useQuery({
    queryKey: queryKeys.team.members(),
    queryFn: () => teamApi.listMembers(),
    enabled: canRead,
  })
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.team.member(id ?? ''),
    queryFn: () => teamApi.getMember(id!),
    enabled: Boolean(id),
  })
}

export function useTeamWorkload() {
  return useQuery({
    queryKey: queryKeys.team.workload(),
    queryFn: () => teamApi.getWorkload(),
  })
}
