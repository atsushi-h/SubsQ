import type { Subscription } from '../../domain/entities/subscription'
import { type SubscriptionResponse, SubscriptionResponseSchema } from '../../dto/subscription.dto'

/**
 * Subscription ドメインエンティティを SubscriptionResponse DTO に変換する
 */
export function toSubscriptionResponse(
  subscription: Subscription,
  paymentMethod: { id: string; name: string } | null,
): SubscriptionResponse {
  const plainSubscription = subscription.toPlainObject()

  const response = {
    id: plainSubscription.id,
    userId: plainSubscription.userId,
    serviceName: plainSubscription.serviceName,
    amount: plainSubscription.amount,
    billingCycle: plainSubscription.billingCycle as 'monthly' | 'yearly',
    baseDate: new Date(plainSubscription.baseDate * 1000).toISOString(),
    paymentMethod,
    memo: plainSubscription.memo,
    createdAt: plainSubscription.createdAt.toISOString(),
    updatedAt: plainSubscription.updatedAt.toISOString(),
  }

  return SubscriptionResponseSchema.parse(response)
}
