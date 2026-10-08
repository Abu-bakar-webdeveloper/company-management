export type NotificationType =
  | 'leave.submitted'
  | 'leave.approved'
  | 'leave.rejected'
  | 'expense.submitted'
  | 'expense.approved'
  | 'expense.rejected'
  | 'salary.paid'
  | 'salary.status_changed'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'task.assigned'
  | 'task.completed'
  | 'user.created'
  | 'user.status_changed'
  | 'user.invite_accepted'
  | 'performance.review_created'
  | 'performance.review_updated'
  | 'client.created'
  | 'company.created'
  | 'attendance.clocked_in'
  | 'attendance.clocked_out'

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  entityType:
    | 'leave'
    | 'expense'
    | 'salary'
    | 'project'
    | 'task'
    | 'user'
    | 'performance'
    | 'client'
    | 'company'
    | 'attendance'
  entityId: string
  actorId: string
  actorName: string
  readAt: string | null
  createdAt: string
}

export type ActivityScope = 'me' | 'team' | 'company' | 'platform'

export type ActivityFeedItem = {
  id: string
  title: string
  description: string
  time: string
  icon: 'user' | 'check' | 'warning'
  module: string
  action: string
  entityType: string
  entityId: string
  createdAt: string
}

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
