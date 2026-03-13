import type {
  ModelsCreateSubscriptionRequest,
  ModelsListSubscriptionsResponse,
  ModelsSubscriptionResponse,
  ModelsUpdateSubscriptionRequest,
} from '@/external/client/api/generated/model'
import {
  subscriptionsCreateSubscription,
  subscriptionsDeleteSubscription,
  subscriptionsDeleteSubscriptions,
  subscriptionsGetSubscription,
  subscriptionsListSubscriptions,
  subscriptionsUpdateSubscription,
} from '@/external/client/api/generated/subscriptions/subscriptions'

export async function listSubscriptions(): Promise<ModelsListSubscriptionsResponse> {
  const res = await subscriptionsListSubscriptions()
  if (res.status !== 200) throw new Error('サブスクリプション一覧の取得に失敗しました')
  return res.data
}

export async function getSubscriptionById(id: string): Promise<ModelsSubscriptionResponse | null> {
  try {
    const res = await subscriptionsGetSubscription(id)
    return res.status === 200 ? res.data : null
  } catch {
    return null
  }
}

export async function createSubscription(
  request: ModelsCreateSubscriptionRequest,
): Promise<ModelsSubscriptionResponse> {
  const res = await subscriptionsCreateSubscription(request)
  if (res.status !== 201) throw new Error('サブスクリプションの作成に失敗しました')
  return res.data
}

export async function updateSubscription(
  id: string,
  request: ModelsUpdateSubscriptionRequest,
): Promise<ModelsSubscriptionResponse> {
  const res = await subscriptionsUpdateSubscription(id, request)
  if (res.status !== 200) throw new Error('サブスクリプションの更新に失敗しました')
  return res.data
}

export async function deleteSubscription(id: string): Promise<void> {
  const res = await subscriptionsDeleteSubscription(id)
  if (res.status !== 204) throw new Error('サブスクリプションの削除に失敗しました')
}

export async function deleteSubscriptions(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const res = await subscriptionsDeleteSubscriptions({ ids })
  if (res.status !== 204) throw new Error('サブスクリプションの削除に失敗しました')
}

export const subscriptionService = {
  listSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  deleteSubscriptions,
}
