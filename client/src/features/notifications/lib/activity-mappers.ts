import type { EmployeeActivityItem } from '@/features/dashboard/employee/model/employeeDashboardData'
import type { ActivityItem } from '@/features/dashboard/ui/RecentActivities'
import { formatRelativeTime } from '@/features/notifications/lib/notification-utils'
import type { ActivityFeedItem } from '@/features/notifications/model/types'

export function toRecentActivityItems(items: ActivityFeedItem[]): ActivityItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    time: formatRelativeTime(item.createdAt),
    icon: item.icon,
  }))
}

export function toEmployeeActivityItems(items: ActivityFeedItem[]): EmployeeActivityItem[] {
  const iconMap = {
    user: 'refresh',
    check: 'check',
    warning: 'play',
  } as const

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    time: formatRelativeTime(item.createdAt),
    icon: iconMap[item.icon],
  }))
}
