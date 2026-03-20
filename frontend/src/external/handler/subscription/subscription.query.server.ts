import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import {
  type GetSubscriptionByIdRequest,
  GetSubscriptionByIdRequestSchema,
  type ListSubscriptionsResponse,
  type SubscriptionResponse,
} from '../../dto/subscription.dto'
import { subscriptionService } from '../../service/subscription/subscription.service'
import { toListSubscriptionsResponse, toSubscriptionResponse } from './subscription.converter'

export async function getSubscriptionByIdQuery(
  request: GetSubscriptionByIdRequest,
): Promise<SubscriptionResponse | null> {
  await requireAuthServer()
  const validated = GetSubscriptionByIdRequestSchema.parse(request)

  const data = await subscriptionService.getSubscriptionById(validated.id)
  if (!data) return null

  return toSubscriptionResponse(data)
}

export async function listSubscriptionsByUserIdQuery(): Promise<ListSubscriptionsResponse> {
  await requireAuthServer()
  const data = await subscriptionService.listSubscriptions()
  return toListSubscriptionsResponse(data)
}
