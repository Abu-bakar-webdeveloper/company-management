import webpush from 'web-push'
import { Types } from 'mongoose'
import { env, isPushConfigured } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'
import type { NotificationEntityType } from './notification.model.js'
import { PushSubscription } from './push-subscription.model.js'
import { notificationDeepLink } from './push-url.js'

export type PushSubscriptionInput = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export type PushPayload = {
  title: string
  body: string
  url: string
}

let vapidConfigured = false

export { isPushConfigured }

function ensureVapid(): void {
  if (!isPushConfigured()) {
    throw new AppError(
      'Web push is not configured on the server',
      503,
      'PUSH_NOT_CONFIGURED',
    )
  }

  if (!vapidConfigured) {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY!,
      env.VAPID_PRIVATE_KEY!,
    )
    vapidConfigured = true
  }
}

export function getVapidPublicKey(): string {
  ensureVapid()
  return env.VAPID_PUBLIC_KEY!
}

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionInput,
  userAgent?: string,
): Promise<void> {
  ensureVapid()

  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      $set: {
        userId: new Types.ObjectId(userId),
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        ...(userAgent ? { userAgent } : {}),
      },
    },
    { upsert: true, new: true },
  )
}

export async function removePushSubscription(
  userId: string,
  endpoint?: string,
): Promise<{ removed: number }> {
  const filter: Record<string, unknown> = {
    userId: new Types.ObjectId(userId),
  }
  if (endpoint) {
    filter.endpoint = endpoint
  }

  const result = await PushSubscription.deleteMany(filter)
  return { removed: result.deletedCount }
}

function isGoneStatus(statusCode: number | undefined): boolean {
  return statusCode === 404 || statusCode === 410
}

export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<void> {
  if (!isPushConfigured() || userIds.length === 0) return

  ensureVapid()

  const uniqueIds = [...new Set(userIds)]
  const subscriptions = await PushSubscription.find({
    userId: { $in: uniqueIds.map((id) => new Types.ObjectId(id)) },
  })

  if (subscriptions.length === 0) return

  const body = JSON.stringify(payload)

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          body,
        )
      } catch (error) {
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error
            ? Number((error as { statusCode: unknown }).statusCode)
            : undefined

        if (isGoneStatus(statusCode)) {
          await PushSubscription.deleteOne({ _id: sub._id })
          return
        }

        console.error('[push] sendNotification failed', {
          endpoint: sub.endpoint,
          statusCode,
          error,
        })
      }
    }),
  )
}

export async function sendPushForNotification(input: {
  recipientIds: string[]
  title: string
  body: string
  entityType: NotificationEntityType
  entityId: string
}): Promise<void> {
  await sendPushToUsers(input.recipientIds, {
    title: input.title,
    body: input.body,
    url: notificationDeepLink(input.entityType, input.entityId),
  })
}
