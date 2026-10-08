import type { Request, Response } from 'express'
import { AppError } from '../../utils/AppError.js'
import { sendSuccess } from '../../utils/apiResponse.js'
import type { UserRole } from '../auth/auth.types.js'
import { enrichAuthUser } from '../auth/auth-user.helper.js'
import type { Permission } from '../auth/permissions.js'
import { User } from '../auth/user.model.js'
import { listActivitiesForUser, type ActivityScope } from './activity.service.js'
import {
  getNotificationPreferences,
  getUnreadCount,
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from './notification.service.js'
import type {
  ListActivitiesQuery,
  ListNotificationsQuery,
  NotificationPreferencesInput,
  PushSubscribeInput,
  PushUnsubscribeInput,
} from './notification.validation.js'
import {
  getVapidPublicKey,
  isPushConfigured,
  removePushSubscription,
  savePushSubscription,
} from './push.service.js'

async function getActivityActor(req: Request) {
  const user = await User.findById(req.user!.id)
  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED')
  }

  const authUser = await enrichAuthUser(user)
  return {
    id: req.user!.id,
    role: authUser.role as UserRole,
    companyId: req.user!.companyId,
    permissions: (authUser.permissions ?? []) as Permission[],
  }
}

export async function listNotificationsHandler(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as ListNotificationsQuery
  const result = await listNotificationsForUser(req.user!.id, {
    page: query.page,
    limit: query.limit,
  })
  sendSuccess(res, result)
}

export async function unreadCountHandler(req: Request, res: Response): Promise<void> {
  const count = await getUnreadCount(req.user!.id)
  sendSuccess(res, { count })
}

export async function markReadHandler(req: Request, res: Response): Promise<void> {
  const notification = await markNotificationRead(req.params.id as string, req.user!.id)
  sendSuccess(res, { notification })
}

export async function markAllReadHandler(req: Request, res: Response): Promise<void> {
  const result = await markAllNotificationsRead(req.user!.id)
  sendSuccess(res, result, { message: 'All notifications marked as read' })
}

export async function listActivitiesHandler(req: Request, res: Response): Promise<void> {
  const query = req.validatedQuery as ListActivitiesQuery
  const actor = await getActivityActor(req)
  const result = await listActivitiesForUser(actor, {
    scope: query.scope as ActivityScope | undefined,
    page: query.page,
    limit: query.limit,
  })
  sendSuccess(res, { activities: result.items, pagination: result.pagination })
}

export async function getPreferencesHandler(req: Request, res: Response): Promise<void> {
  const preferences = await getNotificationPreferences(req.user!.id)
  sendSuccess(res, { preferences })
}

export async function updatePreferencesHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as NotificationPreferencesInput
  const preferences = await updateNotificationPreferences(req.user!.id, body)
  sendSuccess(res, { preferences }, { message: 'Notification preferences saved' })
}

export async function getPushVapidKeyHandler(_req: Request, res: Response): Promise<void> {
  if (!isPushConfigured()) {
    throw new AppError(
      'Web push is not configured on the server',
      503,
      'PUSH_NOT_CONFIGURED',
    )
  }
  sendSuccess(res, { publicKey: getVapidPublicKey() })
}

export async function subscribePushHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as PushSubscribeInput
  await savePushSubscription(req.user!.id, body, req.get('user-agent') ?? undefined)
  sendSuccess(res, { subscribed: true }, { message: 'Push subscription saved' })
}

export async function unsubscribePushHandler(req: Request, res: Response): Promise<void> {
  const body = (req.body ?? {}) as PushUnsubscribeInput
  const result = await removePushSubscription(req.user!.id, body.endpoint)
  sendSuccess(res, result, { message: 'Push subscription removed' })
}
