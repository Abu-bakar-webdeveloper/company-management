import { apiClient } from '@/shared/api/axios'
import type { AppNotification, NotificationPreferences } from '@/features/notifications/model/types'

type ListResult = {
  notifications: AppNotification[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type PushSubscriptionPayload = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export const notificationsApi = {
  async list(params?: { page?: number; limit?: number }): Promise<ListResult> {
    const { data } = await apiClient.get<ListResult>('/notifications', { params })
    return data
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count')
    return data.count
  },

  async markRead(id: string): Promise<AppNotification> {
    const { data } = await apiClient.patch<{ notification: AppNotification }>(
      `/notifications/${id}/read`,
    )
    return data.notification
  },

  async markAllRead(): Promise<{ updated: number }> {
    const { data } = await apiClient.post<{ updated: number }>('/notifications/read-all')
    return data
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const { data } = await apiClient.get<{ preferences: NotificationPreferences }>(
      '/notifications/preferences',
    )
    return data.preferences
  },

  async savePreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    const { data } = await apiClient.patch<{ preferences: NotificationPreferences }>(
      '/notifications/preferences',
      preferences,
    )
    return data.preferences
  },

  async getPushVapidPublicKey(): Promise<{ publicKey: string }> {
    const { data } = await apiClient.get<{ publicKey: string }>(
      '/notifications/push/vapid-public-key',
    )
    return data
  },

  async subscribePush(subscription: PushSubscriptionPayload): Promise<void> {
    await apiClient.post('/notifications/push/subscribe', subscription)
  },

  async unsubscribePush(endpoint?: string): Promise<void> {
    await apiClient.post('/notifications/push/unsubscribe', endpoint ? { endpoint } : {})
  },
}
