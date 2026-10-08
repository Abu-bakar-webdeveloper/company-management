export type NotificationPreferences = {
  email: {
    newUser: boolean
    leaveRequest: boolean
    leaveDecision: boolean
    expenseSubmitted: boolean
    expenseApproved: boolean
  }
  system: {
    taskAssigned: boolean
    projectUpdated: boolean
    performanceReview: boolean
  }
  reminders: {
    leaveExpiry: string
    reviewDeadline: string
    projectDeadline: string
  }
  channels: {
    email: boolean
    inApp: boolean
    push: boolean
    sms: boolean
  }
}

export type NotificationPreferenceKey =
  | 'leaveRequest'
  | 'leaveDecision'
  | 'expenseSubmitted'
  | 'expenseApproved'
  | 'salaryUpdate'
  | 'newUser'
  | 'taskAssigned'
  | 'projectUpdated'
  | 'performanceReview'

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    newUser: true,
    leaveRequest: true,
    leaveDecision: true,
    expenseSubmitted: true,
    expenseApproved: true,
  },
  system: {
    taskAssigned: true,
    projectUpdated: true,
    performanceReview: true,
  },
  reminders: {
    leaveExpiry: '2 Days',
    reviewDeadline: '3 Days',
    projectDeadline: '1 Day',
  },
  channels: {
    email: true,
    inApp: true,
    push: false,
    sms: false,
  },
}

export function mergeNotificationPreferences(
  stored?: Partial<NotificationPreferences> | null,
): NotificationPreferences {
  if (!stored) {
    return {
      email: { ...DEFAULT_NOTIFICATION_PREFERENCES.email },
      system: { ...DEFAULT_NOTIFICATION_PREFERENCES.system },
      reminders: { ...DEFAULT_NOTIFICATION_PREFERENCES.reminders },
      channels: { ...DEFAULT_NOTIFICATION_PREFERENCES.channels },
    }
  }

  return {
    email: { ...DEFAULT_NOTIFICATION_PREFERENCES.email, ...stored.email },
    system: { ...DEFAULT_NOTIFICATION_PREFERENCES.system, ...stored.system },
    reminders: { ...DEFAULT_NOTIFICATION_PREFERENCES.reminders, ...stored.reminders },
    channels: { ...DEFAULT_NOTIFICATION_PREFERENCES.channels, ...stored.channels },
  }
}

function allowsPreferenceKey(
  prefs: NotificationPreferences,
  preferenceKey?: NotificationPreferenceKey,
): boolean {
  if (!preferenceKey) return true

  switch (preferenceKey) {
    case 'leaveRequest':
      return prefs.email.leaveRequest
    case 'leaveDecision':
      return prefs.email.leaveDecision
    case 'expenseSubmitted':
      return prefs.email.expenseSubmitted
    case 'expenseApproved':
      return prefs.email.expenseApproved
    case 'salaryUpdate':
      return true
    case 'newUser':
      return prefs.email.newUser
    case 'taskAssigned':
      return prefs.system.taskAssigned
    case 'projectUpdated':
      return prefs.system.projectUpdated
    case 'performanceReview':
      return prefs.system.performanceReview
    default:
      return true
  }
}

export function allowsInAppNotification(
  prefs: NotificationPreferences,
  preferenceKey?: NotificationPreferenceKey,
): boolean {
  if (!prefs.channels.inApp) return false
  return allowsPreferenceKey(prefs, preferenceKey)
}

export function allowsPushNotification(
  prefs: NotificationPreferences,
  preferenceKey?: NotificationPreferenceKey,
): boolean {
  if (!prefs.channels.push) return false
  return allowsPreferenceKey(prefs, preferenceKey)
}
