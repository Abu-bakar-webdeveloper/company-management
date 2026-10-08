import { Types } from 'mongoose'
import { AppError } from '../../utils/AppError.js'
import { User } from '../auth/user.model.js'
import { Activity } from './activity.model.js'
import { EVENT_CATALOG, type DomainEventContext } from './event-catalog.js'
import {
  allowsInAppNotification,
  allowsPushNotification,
  mergeNotificationPreferences,
  type NotificationPreferences,
} from './notification-preferences.js'
import {
  Notification,
  type NotificationType,
} from './notification.model.js'
import { sendPushForNotification } from './push.service.js'
import { resolveRecipients } from './recipient-resolver.js'

export type DomainEventActor = {
  id: string
  fullName: string
  companyId: string | null
}

export type DispatchDomainEventInput = {
  type: NotificationType
  actor: DomainEventActor
  entityId: string
  subjectUserId?: string
  relatedUserIds?: string[]
  extraRecipientIds?: string[]
  includeAdminHr?: boolean
  context?: DomainEventContext
}

export type NotificationDto = {
  id: string
  type: NotificationType
  title: string
  body: string
  entityType: string
  entityId: string
  actorId: string
  actorName: string
  readAt: string | null
  createdAt: string
}

function toNotificationDto(doc: {
  _id: Types.ObjectId
  type: NotificationType
  title: string
  body: string
  entityType: string
  entityId: Types.ObjectId
  actorId: Types.ObjectId
  actorName: string
  readAt?: Date
  createdAt: Date
}): NotificationDto {
  return {
    id: doc._id.toString(),
    type: doc.type,
    title: doc.title,
    body: doc.body,
    entityType: doc.entityType,
    entityId: doc.entityId.toString(),
    actorId: doc.actorId.toString(),
    actorName: doc.actorName,
    readAt: doc.readAt ? doc.readAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function dispatchDomainEvent(input: DispatchDomainEventInput): Promise<void> {
  const catalog = EVENT_CATALOG[input.type]
  const ctx = input.context ?? {}
  const companyObjectId = input.actor.companyId
    ? new Types.ObjectId(input.actor.companyId)
    : null
  const entityObjectId = new Types.ObjectId(input.entityId)
  const actorObjectId = new Types.ObjectId(input.actor.id)

  const relatedIds = new Set<string>([
    ...(input.relatedUserIds ?? []),
    ...(input.extraRecipientIds ?? []),
  ])
  if (input.subjectUserId) relatedIds.add(input.subjectUserId)
  relatedIds.add(input.actor.id)

  await Activity.create({
    companyId: catalog.visibility === 'platform' ? null : companyObjectId,
    actorId: actorObjectId,
    actorName: input.actor.fullName,
    module: catalog.module,
    action: catalog.action,
    title: catalog.buildActivityTitle(input.actor.fullName, ctx),
    description: catalog.buildActivityDescription(input.actor.fullName, ctx),
    entityType: catalog.entityType,
    entityId: entityObjectId,
    visibility: catalog.visibility,
    relatedUserIds: [...relatedIds].map((id) => new Types.ObjectId(id)),
    ...(catalog.requiredPermission ? { requiredPermission: catalog.requiredPermission } : {}),
    iconHint: catalog.iconHint,
  })

  const recipientIds = await resolveRecipients({
    type: input.type,
    companyId: input.actor.companyId,
    actorId: input.actor.id,
    subjectUserId: input.subjectUserId,
    extraRecipientIds: input.extraRecipientIds,
    includeAdminHr: input.includeAdminHr,
    statusLabel: ctx.statusLabel,
  })

  if (recipientIds.length === 0) return

  const recipients = await User.find({
    _id: { $in: recipientIds.map((id) => new Types.ObjectId(id)) },
  }).select('_id notificationPreferences')

  const title = catalog.buildTitle(input.actor.fullName, ctx)
  const body = catalog.buildBody(input.actor.fullName, ctx)

  const inAppDocs: Array<{
    companyId: Types.ObjectId | null
    recipientId: Types.ObjectId
    actorId: Types.ObjectId
    actorName: string
    type: NotificationType
    title: string
    body: string
    entityType: string
    entityId: Types.ObjectId
  }> = []
  const pushRecipientIds: string[] = []

  for (const user of recipients) {
    const prefs = mergeNotificationPreferences(
      user.notificationPreferences as NotificationPreferences | undefined,
    )
    const userId = user._id.toString()

    if (allowsInAppNotification(prefs, catalog.preferenceKey)) {
      inAppDocs.push({
        companyId: companyObjectId,
        recipientId: user._id,
        actorId: actorObjectId,
        actorName: input.actor.fullName,
        type: input.type,
        title,
        body,
        entityType: catalog.entityType,
        entityId: entityObjectId,
      })
    }

    if (allowsPushNotification(prefs, catalog.preferenceKey)) {
      pushRecipientIds.push(userId)
    }
  }

  if (inAppDocs.length > 0) {
    await Notification.insertMany(inAppDocs)
  }

  if (pushRecipientIds.length > 0) {
    try {
      await sendPushForNotification({
        recipientIds: pushRecipientIds,
        title,
        body,
        entityType: catalog.entityType,
        entityId: input.entityId,
      })
    } catch (error) {
      console.error('[notifications] push send failed', error)
    }
  }
}

/** Never fail the parent mutation if notifications break. */
export async function dispatchDomainEventSafe(input: DispatchDomainEventInput): Promise<void> {
  try {
    await dispatchDomainEvent(input)
  } catch (error) {
    console.error('[notifications] dispatchDomainEvent failed', error)
  }
}

export async function listNotificationsForUser(
  userId: string,
  options: { page?: number; limit?: number } = {},
): Promise<{ notifications: NotificationDto[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(50, Math.max(1, options.limit ?? 20))
  const skip = (page - 1) * limit
  const filter = { recipientId: new Types.ObjectId(userId) }

  const [total, docs] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
  ])

  return {
    notifications: docs.map(toNotificationDto),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Notification.countDocuments({
    recipientId: new Types.ObjectId(userId),
    readAt: { $exists: false },
  })
}

export async function markNotificationRead(
  id: string,
  userId: string,
): Promise<NotificationDto> {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND')
  }

  const doc = await Notification.findOne({
    _id: id,
    recipientId: new Types.ObjectId(userId),
  })

  if (!doc) {
    throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND')
  }

  if (!doc.readAt) {
    doc.readAt = new Date()
    await doc.save()
  }

  return toNotificationDto(doc)
}

export async function markAllNotificationsRead(userId: string): Promise<{ updated: number }> {
  const result = await Notification.updateMany(
    {
      recipientId: new Types.ObjectId(userId),
      readAt: { $exists: false },
    },
    { $set: { readAt: new Date() } },
  )

  return { updated: result.modifiedCount }
}

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const user = await User.findById(userId).select('notificationPreferences')
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }
  return mergeNotificationPreferences(
    user.notificationPreferences as NotificationPreferences | undefined,
  )
}

export async function updateNotificationPreferences(
  userId: string,
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  const user = await User.findById(userId)
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  const merged = mergeNotificationPreferences(prefs)
  user.notificationPreferences = merged
  await user.save()
  return merged
}
