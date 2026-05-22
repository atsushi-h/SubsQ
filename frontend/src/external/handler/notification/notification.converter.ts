import type {
  ModelsListPushSubscriptionsResponse,
  ModelsPushSubscriptionResponse,
} from '@/external/client/api/generated/model'
import {
  type ListPushSubscriptionsResponse,
  ListPushSubscriptionsResponseSchema,
  type PushSubscriptionResponse,
  PushSubscriptionResponseSchema,
} from '../../dto/notification.dto'

export function toPushSubscriptionResponse(
  model: ModelsPushSubscriptionResponse,
): PushSubscriptionResponse {
  return PushSubscriptionResponseSchema.parse(model)
}

export function toListPushSubscriptionsResponse(
  model: ModelsListPushSubscriptionsResponse,
): ListPushSubscriptionsResponse {
  return ListPushSubscriptionsResponseSchema.parse(model)
}
