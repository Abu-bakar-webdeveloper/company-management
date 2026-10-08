import type { AppNotification } from '@/features/notifications/model/types'

export function notificationHref(notification: AppNotification): string {
  switch (notification.entityType) {
    case 'leave':
      return `/leave/requests/${notification.entityId}`
    case 'expense':
      return `/expenses/${notification.entityId}`
    case 'salary':
      return `/salaries/${notification.entityId}`
    case 'project':
      return `/projects/${notification.entityId}`
    case 'task':
      return `/tasks/${notification.entityId}`
    case 'user':
      return `/employees/${notification.entityId}`
    case 'performance':
      return `/performance/${notification.entityId}`
    case 'client':
      return `/clients/${notification.entityId}`
    case 'company':
      return `/companies/${notification.entityId}`
    case 'attendance':
      return `/attendance/${notification.entityId}`
    default:
      return '/dashboard'
  }
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}
