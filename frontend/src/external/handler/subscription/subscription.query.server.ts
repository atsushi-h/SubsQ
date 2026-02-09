import 'server-only'

import { subscriptionTotalCalculator } from '../../domain/services'
import {
  type GetSubscriptionByIdRequest,
  GetSubscriptionByIdRequestSchema,
  type ListSubscriptionsResponse,
  type SubscriptionResponse,
} from '../../dto/subscription.dto'
import { subscriptionService } from '../../service/subscription/subscription.service'
import { toSubscriptionResponse } from './subscription.converter'

export async function getSubscriptionByIdQuery(
  request: GetSubscriptionByIdRequest,
  userId: string,
): Promise<SubscriptionResponse | null> {
  const validated = GetSubscriptionByIdRequestSchema.parse(request)

  const subscription = await subscriptionService.getSubscriptionById(validated.id)
  if (!subscription) return null

  // 認可チェック：自分のサブスクリプションのみ取得可能
  if (!subscription.belongsTo(userId)) {
    throw new Error('Forbidden: You can only access your own subscriptions')
  }

  const paymentMethod = await subscriptionService.getPaymentMethodForSubscription(
    subscription.paymentMethodId,
  )

  return toSubscriptionResponse(subscription, paymentMethod)
}

export async function listSubscriptionsByUserIdQuery(
  userId: string,
): Promise<ListSubscriptionsResponse> {
  const subscriptions = await subscriptionService.getSubscriptionsByUserId(userId)

  // 各subscriptionのpaymentMethodを並列取得
  const subscriptionsWithPaymentMethods = await Promise.all(
    subscriptions.map(async (subscription) => {
      const paymentMethod = await subscriptionService.getPaymentMethodForSubscription(
        subscription.paymentMethodId,
      )
      return { subscription, paymentMethod }
    }),
  )

  const subscriptionResponses = subscriptionsWithPaymentMethods.map(
    ({ subscription, paymentMethod }) => toSubscriptionResponse(subscription, paymentMethod),
  )

  // SubscriptionTotalCalculatorを使って合計を計算
  const totals = subscriptionTotalCalculator.calculate(subscriptions)

  return {
    subscriptions: subscriptionResponses,
    totals,
  }
}
