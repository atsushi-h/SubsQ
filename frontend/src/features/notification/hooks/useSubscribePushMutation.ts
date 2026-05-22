'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { PushSubscriptionRequest } from '@/external/dto/notification.dto'
import { subscribePushCommandAction } from '@/external/handler/notification/notification.command.action'
import { notificationKeys } from '@/features/notification/queries/notification.query-keys'

export function useSubscribePushMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: PushSubscriptionRequest) => subscribePushCommandAction(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscriptions() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '通知の購読登録に失敗しました')
    },
  })
}
