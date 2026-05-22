import { env } from '@/shared/lib/env'

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function subscribePush(): Promise<PushSubscription> {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
  })
  return subscription
}

export function getSubscriptionKeys(subscription: PushSubscription): {
  p256dh: string
  auth: string
} {
  const p256dhKey = subscription.getKey('p256dh')
  const authKey = subscription.getKey('auth')
  if (!p256dhKey || !authKey) throw new Error('Push subscription keys are missing')
  return {
    p256dh: arrayBufferToBase64Url(p256dhKey),
    auth: arrayBufferToBase64Url(authKey),
  }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready
  return registration.pushManager.getSubscription()
}
