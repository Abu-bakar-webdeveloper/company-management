import { notificationsApi } from '@/features/notifications/api/notificationsApi'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function isWebPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register('/sw.js')
}

export async function enableWebPush(): Promise<PushSubscriptionJSON> {
  if (!isWebPushSupported()) {
    throw new Error('Push notifications are not supported in this browser')
  }

  const { publicKey } = await notificationsApi.getPushVapidPublicKey()

  if (Notification.permission === 'denied') {
    throw new Error(
      'Notifications are blocked for this site. Reset permission in your browser site settings, then try again.',
    )
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('Notification permission was denied')
  }

  const registration = await getServiceWorkerRegistration()
  await navigator.serviceWorker.ready

  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }))

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('Invalid push subscription from the browser')
  }

  await notificationsApi.subscribePush({
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  })

  return json
}

export async function disableWebPush(): Promise<void> {
  if (!isWebPushSupported()) {
    await notificationsApi.unsubscribePush()
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  const endpoint = subscription?.endpoint

  if (subscription) {
    await subscription.unsubscribe()
  }

  await notificationsApi.unsubscribePush(endpoint)
}
