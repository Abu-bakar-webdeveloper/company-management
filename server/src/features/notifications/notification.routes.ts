import { Router } from 'express'
import { protect } from '../../middleware/auth.js'
import { asyncHandler } from '../../middleware/asyncHandler.js'
import { requireActive } from '../../middleware/requireActive.js'
import { validate } from '../../middleware/validate.js'
import * as notificationController from './notification.controller.js'
import {
  listActivitiesQuerySchema,
  listNotificationsQuerySchema,
  notificationPreferencesSchema,
  pushSubscribeSchema,
  pushUnsubscribeSchema,
} from './notification.validation.js'

const notificationRouter = Router()

notificationRouter.use(protect, requireActive)

notificationRouter.get(
  '/',
  validate(listNotificationsQuerySchema, 'query'),
  asyncHandler(notificationController.listNotificationsHandler),
)

notificationRouter.get(
  '/unread-count',
  asyncHandler(notificationController.unreadCountHandler),
)

notificationRouter.post(
  '/read-all',
  asyncHandler(notificationController.markAllReadHandler),
)

notificationRouter.get(
  '/preferences',
  asyncHandler(notificationController.getPreferencesHandler),
)

notificationRouter.patch(
  '/preferences',
  validate(notificationPreferencesSchema),
  asyncHandler(notificationController.updatePreferencesHandler),
)

notificationRouter.get(
  '/push/vapid-public-key',
  asyncHandler(notificationController.getPushVapidKeyHandler),
)

notificationRouter.post(
  '/push/subscribe',
  validate(pushSubscribeSchema),
  asyncHandler(notificationController.subscribePushHandler),
)

notificationRouter.post(
  '/push/unsubscribe',
  validate(pushUnsubscribeSchema),
  asyncHandler(notificationController.unsubscribePushHandler),
)

notificationRouter.patch(
  '/:id/read',
  asyncHandler(notificationController.markReadHandler),
)

export default notificationRouter

export const activityRouter = Router()

activityRouter.use(protect, requireActive)

activityRouter.get(
  '/',
  validate(listActivitiesQuerySchema, 'query'),
  asyncHandler(notificationController.listActivitiesHandler),
)
