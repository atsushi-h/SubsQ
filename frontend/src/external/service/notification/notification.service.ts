import type {
  ModelsListPushSubscriptionsResponse,
  ModelsPushSubscriptionResponse,
  ModelsSubscribePushRequest,
  ModelsUnsubscribePushRequest,
} from '@/external/client/api/generated/model'
import {
  notificationsListMySubscriptions,
  notificationsSendTest,
  notificationsSubscribe,
  notificationsUnsubscribe,
} from '@/external/client/api/generated/notifications/notifications'

export async function subscribe(
  request: ModelsSubscribePushRequest,
): Promise<ModelsPushSubscriptionResponse> {
  const res = await notificationsSubscribe(request)
  if (res.status !== 200) throw new Error('プッシュ通知の購読登録に失敗しました')
  return res.data
}

export async function unsubscribe(request: ModelsUnsubscribePushRequest): Promise<void> {
  const res = await notificationsUnsubscribe(request)
  if (res.status !== 204) throw new Error('プッシュ通知の購読解除に失敗しました')
}

export async function listMySubscriptions(): Promise<ModelsListPushSubscriptionsResponse> {
  const res = await notificationsListMySubscriptions()
  if (res.status !== 200) throw new Error('プッシュ購読一覧の取得に失敗しました')
  return res.data
}

export async function sendTest(): Promise<void> {
  const res = await notificationsSendTest()
  if (res.status !== 204) throw new Error('テスト通知の送信に失敗しました')
}
