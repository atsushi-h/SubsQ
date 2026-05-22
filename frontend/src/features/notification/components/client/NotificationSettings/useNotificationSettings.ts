'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePushSubscriptionsQuery } from '@/features/notification/hooks/usePushSubscriptionsQuery'
import { useSendTestNotificationMutation } from '@/features/notification/hooks/useSendTestNotificationMutation'
import { useSubscribePushMutation } from '@/features/notification/hooks/useSubscribePushMutation'
import { useUnsubscribePushMutation } from '@/features/notification/hooks/useUnsubscribePushMutation'
import {
  getCurrentPushSubscription,
  getSubscriptionKeys,
  subscribePush,
} from '@/features/notification/lib/pushSubscription'
import { isWebPushSupported } from '@/features/notification/lib/webPushSupport'

export function useNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: subscriptionsData } = usePushSubscriptionsQuery()
  const subscribeMutation = useSubscribePushMutation()
  const unsubscribeMutation = useUnsubscribePushMutation()
  const sendTestMutation = useSendTestNotificationMutation()

  useEffect(() => {
    const supported = isWebPushSupported()
    setIsSupported(supported)
    if (supported) {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (!isSupported) return
    getCurrentPushSubscription().then((browserSub) => {
      if (!browserSub) {
        setIsSubscribed(false)
        return
      }
      const backendSubs = subscriptionsData?.subscriptions ?? []
      const registeredInBackend = backendSubs.some((s) => s.endpoint === browserSub.endpoint)
      setIsSubscribed(permission === 'granted' && registeredInBackend)
    })
  }, [isSupported, permission, subscriptionsData])

  const handleToggle = useCallback(async () => {
    if (!isSupported) return
    setError(null)
    setIsToggling(true)
    try {
      if (isSubscribed) {
        const browserSub = await getCurrentPushSubscription()
        if (browserSub) {
          await browserSub.unsubscribe()
          await unsubscribeMutation.mutateAsync(browserSub.endpoint)
        }
        setIsSubscribed(false)
      } else {
        const perm = await Notification.requestPermission()
        setPermission(perm)
        if (perm !== 'granted') return
        const browserSub = await subscribePush()
        const keys = getSubscriptionKeys(browserSub)
        await subscribeMutation.mutateAsync({
          endpoint: browserSub.endpoint,
          keys,
          userAgent: navigator.userAgent,
        })
        setIsSubscribed(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作に失敗しました')
    } finally {
      setIsToggling(false)
    }
  }, [isSupported, isSubscribed, subscribeMutation, unsubscribeMutation])

  const handleSendTest = useCallback(() => {
    sendTestMutation.mutate()
  }, [sendTestMutation])

  return {
    isSupported,
    isSubscribed,
    isToggling,
    isSendingTest: sendTestMutation.isPending,
    permission,
    error,
    handleToggle,
    handleSendTest,
  }
}
