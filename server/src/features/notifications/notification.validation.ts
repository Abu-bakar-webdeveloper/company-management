import { z } from 'zod'
import { paginationQuerySchema } from '../../utils/pagination.js'

export const listNotificationsQuerySchema = paginationQuerySchema

export const listActivitiesQuerySchema = z.object({
  scope: z.enum(['me', 'team', 'company', 'platform']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const notificationPreferencesSchema = z.object({
  email: z.object({
    newUser: z.boolean(),
    leaveRequest: z.boolean(),
    leaveDecision: z.boolean(),
    expenseSubmitted: z.boolean(),
    expenseApproved: z.boolean(),
  }),
  system: z.object({
    taskAssigned: z.boolean(),
    projectUpdated: z.boolean(),
    performanceReview: z.boolean(),
  }),
  reminders: z.object({
    leaveExpiry: z.string().min(1).max(50),
    reviewDeadline: z.string().min(1).max(50),
    projectDeadline: z.string().min(1).max(50),
  }),
  channels: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
})

export const pushSubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url().optional(),
})

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>
export type ListActivitiesQuery = z.infer<typeof listActivitiesQuerySchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type PushSubscribeInput = z.infer<typeof pushSubscribeSchema>
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>
