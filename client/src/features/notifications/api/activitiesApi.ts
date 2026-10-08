import { apiClient } from '@/shared/api/axios'
import type { ActivityFeedItem, ActivityScope } from '@/features/notifications/model/types'

export type ListActivitiesParams = {
  scope?: ActivityScope
  page?: number
  limit?: number
}

export type ListActivitiesResult = {
  activities: ActivityFeedItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const activitiesApi = {
  async list(params?: ListActivitiesParams): Promise<ListActivitiesResult> {
    const { data } = await apiClient.get<ListActivitiesResult>('/activities', { params })
    return data
  },
}
