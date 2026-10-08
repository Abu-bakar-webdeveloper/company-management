import type { NotificationEntityType } from './notification.model.js'

/** App path opened when the user clicks a push notification. */
export function notificationDeepLink(
  entityType: NotificationEntityType,
  entityId: string,
): string {
  switch (entityType) {
    case 'leave':
      return `/leave/requests/${entityId}`
    case 'expense':
      return `/expenses/${entityId}`
    case 'salary':
      return `/salaries/${entityId}`
    case 'project':
      return `/projects/${entityId}`
    case 'task':
      return `/tasks/${entityId}`
    case 'user':
      return `/employees/${entityId}`
    case 'performance':
      return `/performance/${entityId}`
    case 'client':
      return `/clients/${entityId}`
    case 'company':
      return `/companies/${entityId}`
    case 'attendance':
      return `/attendance/${entityId}`
    default:
      return '/dashboard'
  }
}
