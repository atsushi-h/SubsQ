'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreateSubscriptionRequest } from '@/external/dto/subscription.dto'
import { createSubscriptionCommandAction } from '@/external/handler/subscription/subscription.command.action'
import { subscriptionKeys } from '@/features/subscription/queries/subscription.query-keys'

export function useCreateSubscriptionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<CreateSubscriptionRequest, 'userId'>) =>
      createSubscriptionCommandAction(data),
    onSuccess: () => {
      toast.success('サブスクリプションを作成しました')
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '作成に失敗しました')
    },
  })
}
