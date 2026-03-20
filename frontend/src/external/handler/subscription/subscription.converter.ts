import type {
  ModelsListSubscriptionsResponse,
  ModelsSubscriptionResponse,
} from '@/external/client/api/generated/model'
import {
  type ListSubscriptionsResponse,
  ListSubscriptionsResponseSchema,
  type SubscriptionResponse,
  SubscriptionResponseSchema,
} from '../../dto/subscription.dto'

export function toSubscriptionResponse(model: ModelsSubscriptionResponse): SubscriptionResponse {
  return SubscriptionResponseSchema.parse(model)
}

export function toListSubscriptionsResponse(
  model: ModelsListSubscriptionsResponse,
): ListSubscriptionsResponse {
  return ListSubscriptionsResponseSchema.parse(model)
}
