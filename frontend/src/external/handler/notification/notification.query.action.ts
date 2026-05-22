'use server'

import { withAuth } from '@/features/auth/servers/auth.guard'
import { listMyPushSubscriptionsQuery } from './notification.query.server'

export async function listMyPushSubscriptionsQueryAction() {
  return withAuth(() => listMyPushSubscriptionsQuery())
}
