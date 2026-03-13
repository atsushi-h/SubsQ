'use server'

import type {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '@/external/dto/subscription.dto'
import {
  createSubscriptionCommand,
  deleteSubscriptionCommand,
  deleteSubscriptionsCommand,
  updateSubscriptionCommand,
} from '@/external/handler/subscription/subscription.command.server'
import { withAuth } from '@/features/auth/servers/auth.guard'

export async function createSubscriptionCommandAction(data: CreateSubscriptionRequest) {
  return withAuth(() => createSubscriptionCommand(data))
}

export async function updateSubscriptionCommandAction(request: UpdateSubscriptionRequest) {
  return withAuth(() => updateSubscriptionCommand(request))
}

export async function deleteSubscriptionCommandAction(subscriptionId: string) {
  return withAuth(() => deleteSubscriptionCommand(subscriptionId))
}

export async function deleteSubscriptionsCommandAction(subscriptionIds: string[]) {
  return withAuth(() => deleteSubscriptionsCommand(subscriptionIds))
}
