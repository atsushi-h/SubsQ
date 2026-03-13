import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import {
  type CreateSubscriptionRequest,
  CreateSubscriptionRequestSchema,
  type CreateSubscriptionResponse,
  type UpdateSubscriptionRequest,
  UpdateSubscriptionRequestSchema,
  type UpdateSubscriptionResponse,
} from '../../dto/subscription.dto'
import { subscriptionService } from '../../service/subscription/subscription.service'
import { toSubscriptionResponse } from './subscription.converter'

export async function createSubscriptionCommand(
  request: CreateSubscriptionRequest,
): Promise<CreateSubscriptionResponse> {
  await requireAuthServer()
  const { paymentMethodId, ...rest } = CreateSubscriptionRequestSchema.parse(request)

  const data = await subscriptionService.createSubscription({
    ...rest,
    paymentMethodId: paymentMethodId ?? undefined,
  })
  return toSubscriptionResponse(data)
}

export async function updateSubscriptionCommand(
  request: UpdateSubscriptionRequest,
): Promise<UpdateSubscriptionResponse> {
  await requireAuthServer()
  const { id, paymentMethodId, ...rest } = UpdateSubscriptionRequestSchema.parse(request)

  const data = await subscriptionService.updateSubscription(id, {
    ...rest,
    paymentMethodId: paymentMethodId ?? undefined,
  })
  return toSubscriptionResponse(data)
}

export async function deleteSubscriptionCommand(subscriptionId: string): Promise<void> {
  await requireAuthServer()
  await subscriptionService.deleteSubscription(subscriptionId)
}

export async function deleteSubscriptionsCommand(subscriptionIds: string[]): Promise<void> {
  await requireAuthServer()
  await subscriptionService.deleteSubscriptions(subscriptionIds)
}
