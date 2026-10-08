import type { Permission } from '../auth/permissions.js'
import type { ActivityIconHint, ActivityModule, ActivityVisibility } from './activity.model.js'
import type { NotificationEntityType, NotificationType } from './notification.model.js'
import type { NotificationPreferenceKey } from './notification-preferences.js'

export type DomainEventContext = {
  subjectName?: string
  entityLabel?: string
  statusLabel?: string
  note?: string
}

export type EventCatalogEntry = {
  module: ActivityModule
  entityType: NotificationEntityType
  action: string
  visibility: ActivityVisibility
  requiredPermission?: Permission
  iconHint: ActivityIconHint
  preferenceKey?: NotificationPreferenceKey
  buildTitle: (actorName: string, ctx: DomainEventContext) => string
  buildBody: (actorName: string, ctx: DomainEventContext) => string
  buildActivityTitle: (actorName: string, ctx: DomainEventContext) => string
  buildActivityDescription: (actorName: string, ctx: DomainEventContext) => string
}

export const EVENT_CATALOG: Record<NotificationType, EventCatalogEntry> = {
  'leave.submitted': {
    module: 'leave',
    entityType: 'leave',
    action: 'submitted',
    visibility: 'team',
    iconHint: 'user',
    preferenceKey: 'leaveRequest',
    buildTitle: () => 'Leave request submitted',
    buildBody: (actor, ctx) =>
      `${ctx.subjectName ?? actor} submitted a leave request${ctx.entityLabel ? ` (${ctx.entityLabel})` : ''}.`,
    buildActivityTitle: () => 'Leave request submitted',
    buildActivityDescription: (actor, ctx) =>
      `${ctx.subjectName ?? actor} submitted a leave request.`,
  },
  'leave.approved': {
    module: 'leave',
    entityType: 'leave',
    action: 'approved',
    visibility: 'team',
    iconHint: 'check',
    preferenceKey: 'leaveDecision',
    buildTitle: () => 'Leave request approved',
    buildBody: (actor, ctx) =>
      `${actor} approved your leave request${ctx.entityLabel ? ` (${ctx.entityLabel})` : ''}.`,
    buildActivityTitle: () => 'Leave request approved',
    buildActivityDescription: (actor, ctx) =>
      `${actor} approved leave for ${ctx.subjectName ?? 'an employee'}.`,
  },
  'leave.rejected': {
    module: 'leave',
    entityType: 'leave',
    action: 'rejected',
    visibility: 'team',
    iconHint: 'warning',
    preferenceKey: 'leaveDecision',
    buildTitle: () => 'Leave request rejected',
    buildBody: (actor, ctx) =>
      `${actor} rejected your leave request${ctx.note ? `: ${ctx.note}` : '.'}`,
    buildActivityTitle: () => 'Leave request rejected',
    buildActivityDescription: (actor, ctx) =>
      `${actor} rejected leave for ${ctx.subjectName ?? 'an employee'}.`,
  },
  'expense.submitted': {
    module: 'expense',
    entityType: 'expense',
    action: 'submitted',
    visibility: 'company',
    requiredPermission: 'expenses:read',
    iconHint: 'user',
    preferenceKey: 'expenseSubmitted',
    buildTitle: () => 'Expense submitted',
    buildBody: (actor, ctx) =>
      `${actor} submitted an expense${ctx.entityLabel ? `: ${ctx.entityLabel}` : ''}.`,
    buildActivityTitle: () => 'Expense submitted',
    buildActivityDescription: (actor, ctx) =>
      `${actor} submitted ${ctx.entityLabel ?? 'an expense'}.`,
  },
  'expense.approved': {
    module: 'expense',
    entityType: 'expense',
    action: 'approved',
    visibility: 'company',
    requiredPermission: 'expenses:read',
    iconHint: 'check',
    preferenceKey: 'expenseApproved',
    buildTitle: () => 'Expense approved',
    buildBody: (actor, ctx) =>
      `${actor} approved your expense${ctx.entityLabel ? `: ${ctx.entityLabel}` : ''}.`,
    buildActivityTitle: () => 'Expense approved',
    buildActivityDescription: (actor, ctx) =>
      `${actor} approved ${ctx.entityLabel ?? 'an expense'}.`,
  },
  'expense.rejected': {
    module: 'expense',
    entityType: 'expense',
    action: 'rejected',
    visibility: 'company',
    requiredPermission: 'expenses:read',
    iconHint: 'warning',
    preferenceKey: 'expenseApproved',
    buildTitle: () => 'Expense rejected',
    buildBody: (actor, ctx) =>
      `${actor} rejected your expense${ctx.note ? `: ${ctx.note}` : '.'}`,
    buildActivityTitle: () => 'Expense rejected',
    buildActivityDescription: (actor, ctx) =>
      `${actor} rejected ${ctx.entityLabel ?? 'an expense'}.`,
  },
  'salary.paid': {
    module: 'salary',
    entityType: 'salary',
    action: 'paid',
    visibility: 'private',
    requiredPermission: 'salaries:read',
    iconHint: 'check',
    preferenceKey: 'salaryUpdate',
    buildTitle: () => 'Salary marked as paid',
    buildBody: (actor, ctx) =>
      `${actor} marked your salary as paid${ctx.entityLabel ? ` (${ctx.entityLabel})` : ''}.`,
    buildActivityTitle: () => 'Salary paid',
    buildActivityDescription: (actor, ctx) =>
      `${actor} marked salary as paid for ${ctx.subjectName ?? 'an employee'}.`,
  },
  'salary.status_changed': {
    module: 'salary',
    entityType: 'salary',
    action: 'status_changed',
    visibility: 'private',
    requiredPermission: 'salaries:read',
    iconHint: 'user',
    preferenceKey: 'salaryUpdate',
    buildTitle: () => 'Salary status updated',
    buildBody: (actor, ctx) =>
      `${actor} updated your salary status${ctx.statusLabel ? ` to ${ctx.statusLabel}` : ''}.`,
    buildActivityTitle: () => 'Salary status updated',
    buildActivityDescription: (actor, ctx) =>
      `${actor} updated salary status for ${ctx.subjectName ?? 'an employee'}${
        ctx.statusLabel ? ` to ${ctx.statusLabel}` : ''
      }.`,
  },
  'project.created': {
    module: 'project',
    entityType: 'project',
    action: 'created',
    visibility: 'company',
    requiredPermission: 'projects:read',
    iconHint: 'user',
    preferenceKey: 'projectUpdated',
    buildTitle: () => 'Project created',
    buildBody: (actor, ctx) =>
      `${actor} created project${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ''}.`,
    buildActivityTitle: () => 'Project created',
    buildActivityDescription: (actor, ctx) =>
      `${actor} created ${ctx.entityLabel ?? 'a project'}.`,
  },
  'project.updated': {
    module: 'project',
    entityType: 'project',
    action: 'updated',
    visibility: 'company',
    requiredPermission: 'projects:read',
    iconHint: 'user',
    preferenceKey: 'projectUpdated',
    buildTitle: () => 'Project updated',
    buildBody: (actor, ctx) =>
      `${actor} updated project${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ''}${
        ctx.statusLabel ? ` (${ctx.statusLabel})` : ''
      }.`,
    buildActivityTitle: () => 'Project updated',
    buildActivityDescription: (actor, ctx) =>
      `${actor} updated ${ctx.entityLabel ?? 'a project'}.`,
  },
  'project.deleted': {
    module: 'project',
    entityType: 'project',
    action: 'deleted',
    visibility: 'company',
    requiredPermission: 'projects:read',
    iconHint: 'warning',
    preferenceKey: 'projectUpdated',
    buildTitle: () => 'Project deleted',
    buildBody: (actor, ctx) =>
      `${actor} deleted project${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ''}.`,
    buildActivityTitle: () => 'Project deleted',
    buildActivityDescription: (actor, ctx) =>
      `${actor} deleted ${ctx.entityLabel ?? 'a project'}.`,
  },
  'task.assigned': {
    module: 'task',
    entityType: 'task',
    action: 'assigned',
    visibility: 'team',
    requiredPermission: 'tasks:read',
    iconHint: 'user',
    preferenceKey: 'taskAssigned',
    buildTitle: () => 'Task assigned',
    buildBody: (actor, ctx) =>
      `${actor} assigned you${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ' a task'}.`,
    buildActivityTitle: () => 'Task assigned',
    buildActivityDescription: (actor, ctx) =>
      `${actor} assigned ${ctx.entityLabel ?? 'a task'} to ${ctx.subjectName ?? 'a teammate'}.`,
  },
  'task.completed': {
    module: 'task',
    entityType: 'task',
    action: 'completed',
    visibility: 'team',
    requiredPermission: 'tasks:read',
    iconHint: 'check',
    preferenceKey: 'taskAssigned',
    buildTitle: () => 'Task completed',
    buildBody: (actor, ctx) =>
      `${actor} completed${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ' a task'}.`,
    buildActivityTitle: () => 'Task completed',
    buildActivityDescription: (actor, ctx) =>
      `${actor} completed ${ctx.entityLabel ?? 'a task'}.`,
  },
  'user.created': {
    module: 'user',
    entityType: 'user',
    action: 'created',
    visibility: 'company',
    requiredPermission: 'employees:read',
    iconHint: 'user',
    preferenceKey: 'newUser',
    buildTitle: () => 'New user created',
    buildBody: (actor, ctx) =>
      `${actor} added ${ctx.subjectName ?? 'a new user'} to the company.`,
    buildActivityTitle: () => 'New user created',
    buildActivityDescription: (actor, ctx) =>
      `${actor} created user ${ctx.subjectName ?? 'account'}.`,
  },
  'user.status_changed': {
    module: 'user',
    entityType: 'user',
    action: 'status_changed',
    visibility: 'company',
    requiredPermission: 'employees:read',
    iconHint: 'warning',
    preferenceKey: 'newUser',
    buildTitle: () => 'Account status updated',
    buildBody: (actor, ctx) =>
      `${actor} set your account status${ctx.statusLabel ? ` to ${ctx.statusLabel}` : ''}.`,
    buildActivityTitle: () => 'User status updated',
    buildActivityDescription: (actor, ctx) =>
      `${actor} set ${ctx.subjectName ?? 'a user'} status${
        ctx.statusLabel ? ` to ${ctx.statusLabel}` : ''
      }.`,
  },
  'user.invite_accepted': {
    module: 'user',
    entityType: 'user',
    action: 'invite_accepted',
    visibility: 'company',
    requiredPermission: 'employees:read',
    iconHint: 'check',
    preferenceKey: 'newUser',
    buildTitle: () => 'Invite accepted',
    buildBody: (_actor, ctx) =>
      `${ctx.subjectName ?? 'A user'} accepted their invite and joined the company.`,
    buildActivityTitle: () => 'Invite accepted',
    buildActivityDescription: (_actor, ctx) =>
      `${ctx.subjectName ?? 'A user'} joined the company.`,
  },
  'performance.review_created': {
    module: 'performance',
    entityType: 'performance',
    action: 'review_created',
    visibility: 'team',
    requiredPermission: 'performance:read',
    iconHint: 'user',
    preferenceKey: 'performanceReview',
    buildTitle: () => 'Performance review created',
    buildBody: (actor, ctx) =>
      `${actor} created a performance review${ctx.entityLabel ? ` (${ctx.entityLabel})` : ''}.`,
    buildActivityTitle: () => 'Performance review created',
    buildActivityDescription: (actor, ctx) =>
      `${actor} created a review for ${ctx.subjectName ?? 'an employee'}.`,
  },
  'performance.review_updated': {
    module: 'performance',
    entityType: 'performance',
    action: 'review_updated',
    visibility: 'team',
    requiredPermission: 'performance:read',
    iconHint: 'check',
    preferenceKey: 'performanceReview',
    buildTitle: () => 'Performance review updated',
    buildBody: (actor, ctx) =>
      `${actor} updated your performance review${ctx.statusLabel ? ` (${ctx.statusLabel})` : ''}.`,
    buildActivityTitle: () => 'Performance review updated',
    buildActivityDescription: (actor, ctx) =>
      `${actor} updated a review for ${ctx.subjectName ?? 'an employee'}.`,
  },
  'client.created': {
    module: 'client',
    entityType: 'client',
    action: 'created',
    visibility: 'company',
    requiredPermission: 'clients:read',
    iconHint: 'user',
    buildTitle: () => 'Client created',
    buildBody: (actor, ctx) =>
      `${actor} added client${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ''}.`,
    buildActivityTitle: () => 'Client created',
    buildActivityDescription: (actor, ctx) =>
      `${actor} created ${ctx.entityLabel ?? 'a client'}.`,
  },
  'company.created': {
    module: 'company',
    entityType: 'company',
    action: 'created',
    visibility: 'platform',
    iconHint: 'user',
    buildTitle: () => 'Company created',
    buildBody: (actor, ctx) =>
      `${actor} created company${ctx.entityLabel ? ` “${ctx.entityLabel}”` : ''}.`,
    buildActivityTitle: () => 'Company created',
    buildActivityDescription: (actor, ctx) =>
      `${actor} created ${ctx.entityLabel ?? 'a company'}.`,
  },
  'attendance.clocked_in': {
    module: 'attendance',
    entityType: 'attendance',
    action: 'clocked_in',
    visibility: 'team',
    requiredPermission: 'attendance:team',
    iconHint: 'check',
    buildTitle: () => 'Employee clocked in',
    buildBody: (actor, ctx) =>
      `${ctx.subjectName ?? actor} clocked in${ctx.entityLabel ? ` (${ctx.entityLabel})` : ''}.`,
    buildActivityTitle: () => 'Clocked in',
    buildActivityDescription: (actor, ctx) =>
      `${ctx.subjectName ?? actor} clocked in.`,
  },
  'attendance.clocked_out': {
    module: 'attendance',
    entityType: 'attendance',
    action: 'clocked_out',
    visibility: 'team',
    requiredPermission: 'attendance:team',
    iconHint: 'user',
    buildTitle: () => 'Employee clocked out',
    buildBody: (actor, ctx) =>
      `${ctx.subjectName ?? actor} clocked out${ctx.entityLabel ? ` (${ctx.entityLabel})` : ''}.`,
    buildActivityTitle: () => 'Clocked out',
    buildActivityDescription: (actor, ctx) =>
      `${ctx.subjectName ?? actor} clocked out.`,
  },
}
