'use server'

import type { GetSubscriptionByIdRequest } from '@/external/dto/subscription.dto'
import {
  getSubscriptionByIdQuery,
  listSubscriptionsByUserIdQuery,
} from '@/external/handler/subscription/subscription.query.server'
import { withAuth } from '@/features/auth/servers/auth.guard'

export async function getSubscriptionByIdQueryAction(request: GetSubscriptionByIdRequest) {
  return withAuth(() => getSubscriptionByIdQuery(request))
}

export async function listSubscriptionsByUserIdQueryAction() {
  return withAuth(() => listSubscriptionsByUserIdQuery())
}
