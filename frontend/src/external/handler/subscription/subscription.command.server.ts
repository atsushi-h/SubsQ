import 'server-only'

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
  userId: string,
): Promise<CreateSubscriptionResponse> {
  const validated = CreateSubscriptionRequestSchema.parse(request)

  if (userId !== validated.userId) {
    throw new Error('Forbidden: Can only create subscriptions for yourself')
  }

  // ISO datetime文字列をUnix秒に変換
  const subscription = await subscriptionService.create({
    ...validated,
    baseDate: Math.floor(new Date(validated.baseDate).getTime() / 1000),
  })

  const paymentMethod = await subscriptionService.getPaymentMethodForSubscription(
    subscription.paymentMethodId,
  )

  return toSubscriptionResponse(subscription, paymentMethod)
}

export async function updateSubscriptionCommand(
  request: UpdateSubscriptionRequest,
  userId: string,
): Promise<UpdateSubscriptionResponse> {
  const validated = UpdateSubscriptionRequestSchema.parse(request)

  // ISO datetime文字列をUnix秒に変換（指定されている場合のみ）
  const updateInput = {
    ...validated,
    baseDate: validated.baseDate
      ? Math.floor(new Date(validated.baseDate).getTime() / 1000)
      : undefined,
  }

  const updatedSubscription = await subscriptionService.update(validated.id, userId, updateInput)

  const paymentMethod = await subscriptionService.getPaymentMethodForSubscription(
    updatedSubscription.paymentMethodId,
  )

  return toSubscriptionResponse(updatedSubscription, paymentMethod)
}

export async function deleteSubscriptionCommand(
  subscriptionId: string,
  userId: string,
): Promise<void> {
  await subscriptionService.delete(subscriptionId, userId)
}

export async function deleteSubscriptionsCommand(
  subscriptionIds: string[],
  userId: string,
): Promise<void> {
  await subscriptionService.deleteMany(subscriptionIds, userId)
}
