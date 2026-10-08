import type { ClientFormValues } from '@/features/clients/model/schemas'
import type { Client, ClientOption, ClientStats } from '@/features/clients/model/types'
import { apiClient } from '@/shared/api/axios'

export type ListClientsParams = {
  page?: number
  limit?: number
  status?: 'active' | 'inactive'
  search?: string
}

export type ListClientsResult = {
  clients: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const clientsApi = {
  async list(params?: ListClientsParams): Promise<Client[]> {
    const { data } = await apiClient.get<ListClientsResult>('/clients', {
      params: { limit: 100, ...params },
    })
    return data.clients
  },

  async listPaginated(params?: ListClientsParams): Promise<ListClientsResult> {
    const { data } = await apiClient.get<ListClientsResult>('/clients', { params })
    return data
  },

  async listOptions(): Promise<ClientOption[]> {
    const { data } = await apiClient.get<{ clients: ClientOption[] }>('/clients/options')
    return data.clients
  },

  async getStats(): Promise<ClientStats> {
    const { data } = await apiClient.get<{ stats: ClientStats }>('/clients/stats')
    return data.stats
  },

  async getById(id: string): Promise<Client | null> {
    try {
      const { data } = await apiClient.get<{ client: Client }>(`/clients/${id}`)
      return data.client
    } catch {
      return null
    }
  },

  async create(values: ClientFormValues): Promise<Client> {
    const { data } = await apiClient.post<{ client: Client }>('/clients', values)
    return data.client
  },

  async update(id: string, values: ClientFormValues): Promise<Client> {
    const { data } = await apiClient.patch<{ client: Client }>(`/clients/${id}`, values)
    return data.client
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/clients/${id}`)
  },
}
