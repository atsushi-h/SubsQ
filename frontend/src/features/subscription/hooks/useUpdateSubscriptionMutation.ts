'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdateSubscriptionRequest } from '@/external/dto/subscription.dto'
import { updateSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useUpdateSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSubscriptionRequest) => updateSubscriptionCommandAction(data),
    onSuccess: (_, variables) => {
      toast.success('サブスクリプションを更新しました')
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(variables.id) })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新に失敗しました')
    },
  })
}
