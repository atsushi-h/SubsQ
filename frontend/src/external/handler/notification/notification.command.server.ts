import 'server-only'

import {
  type PushSubscriptionRequest,
  PushSubscriptionRequestSchema,
  type PushSubscriptionResponse,
} from '@/external/dto/notification.dto'
import * as notificationService from '@/external/service/notification/notification.service'
import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { toPushSubscriptionResponse } from './notification.converter'

export async function subscribePushCommand(
  request: PushSubscriptionRequest,
): Promise<PushSubscriptionResponse> {
  await requireAuthServer()
  const validated = PushSubscriptionRequestSchema.parse(request)
  const data = await notificationService.subscribe({
    endpoint: validated.endpoint,
    p256dh: validated.keys.p256dh,
    auth: validated.keys.auth,
    userAgent: validated.userAgent,
  })
  return toPushSubscriptionResponse(data)
}

export async function unsubscribePushCommand(endpoint: string): Promise<void> {
  await requireAuthServer()
  await notificationService.unsubscribe({ endpoint })
}

export async function sendTestNotificationCommand(): Promise<void> {
  await requireAuthServer()
  await notificationService.sendTest()
}
