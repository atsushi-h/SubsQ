'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deleteSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useDeleteSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subscriptionId: string) => deleteSubscriptionCommandAction(subscriptionId),
    onSuccess: () => {
      toast.success('サブスクリプションを削除しました')
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '削除に失敗しました')
    },
  })
}
