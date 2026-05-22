'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { sendTestNotificationCommandAction } from '@/external/handler/notification/notification.command.action'

export function useSendTestNotificationMutation() {
  return useMutation({
    mutationFn: () => sendTestNotificationCommandAction(),
    onSuccess: () => {
      toast.success('テスト通知を送信しました')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'テスト通知の送信に失敗しました')
    },
  })
}
