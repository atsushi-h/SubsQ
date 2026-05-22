'use server'

import type { PushSubscriptionRequest } from '@/external/dto/notification.dto'
import { withAuth } from '@/features/auth/servers/auth.guard'
import {
  sendTestNotificationCommand,
  subscribePushCommand,
  unsubscribePushCommand,
} from './notification.command.server'

export async function subscribePushCommandAction(request: PushSubscriptionRequest) {
  return withAuth(() => subscribePushCommand(request))
}

export async function unsubscribePushCommandAction(endpoint: string) {
  return withAuth(() => unsubscribePushCommand(endpoint))
}

export async function sendTestNotificationCommandAction() {
  return withAuth(() => sendTestNotificationCommand())
}
