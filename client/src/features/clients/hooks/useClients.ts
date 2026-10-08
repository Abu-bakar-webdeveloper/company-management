import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientsApi, type ListClientsParams } from '@/features/clients/api/clientsApi'
import type { ClientFormValues } from '@/features/clients/model/schemas'
import { queryKeys } from '@/shared/api/queryKeys'

export function useClientsList(params?: ListClientsParams) {
  return useQuery({
    queryKey: queryKeys.clients.list(params),
    queryFn: () => clientsApi.list(params),
  })
}

export function useClientOptions(enabled = true) {
  return useQuery({
    queryKey: queryKeys.clients.options(),
    queryFn: () => clientsApi.listOptions(),
    enabled,
  })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id ?? ''),
    queryFn: () => clientsApi.getById(id!),
    enabled: Boolean(id),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ClientFormValues) => clientsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ClientFormValues) => clientsApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clientId: string) => clientsApi.remove(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.all })
    },
  })
}
