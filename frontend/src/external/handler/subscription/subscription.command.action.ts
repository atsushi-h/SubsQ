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

export async function createSubscriptionCommandAction(request: CreateSubscriptionRequest) {
  return withAuth(({ userId }) => createSubscriptionCommand(request, userId))
}

export async function updateSubscriptionCommandAction(request: UpdateSubscriptionRequest) {
  return withAuth(({ userId }) => updateSubscriptionCommand(request, userId))
}

export async function deleteSubscriptionCommandAction(subscriptionId: string) {
  return withAuth(({ userId }) => deleteSubscriptionCommand(subscriptionId, userId))
}

export async function deleteSubscriptionsCommandAction(subscriptionIds: string[]) {
  return withAuth(({ userId }) => deleteSubscriptionsCommand(subscriptionIds, userId))
}
