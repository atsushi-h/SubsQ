import 'server-only'

import type { ListPushSubscriptionsResponse } from '@/external/dto/notification.dto'
import * as notificationService from '@/external/service/notification/notification.service'
import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import { toListPushSubscriptionsResponse } from './notification.converter'

export async function listMyPushSubscriptionsQuery(): Promise<ListPushSubscriptionsResponse> {
  await requireAuthServer()
  const data = await notificationService.listMySubscriptions()
  return toListPushSubscriptionsResponse(data)
}
