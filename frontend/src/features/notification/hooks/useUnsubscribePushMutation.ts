'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { unsubscribePushCommandAction } from '@/external/handler/notification/notification.command.action'
import { notificationKeys } from '@/features/notification/queries/notification.query-keys'

export function useUnsubscribePushMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (endpoint: string) => unsubscribePushCommandAction(endpoint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.subscriptions() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '通知の購読解除に失敗しました')
    },
  })
}
