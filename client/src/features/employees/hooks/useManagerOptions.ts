import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/shared/api/usersApi'
import { queryKeys } from '@/shared/api/queryKeys'

export function useManagerOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users.managerOptions(),
    queryFn: () => usersApi.listManagerOptions(),
    enabled,
  })
}
