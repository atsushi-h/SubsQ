'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { CreatePaymentMethodRequest } from '@/external/dto/payment-method.dto'
import { createPaymentMethodCommandAction } from '@/external/handler/payment-method/payment-method.command.action'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'

export function useCreatePaymentMethodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: Omit<CreatePaymentMethodRequest, 'userId'>) =>
      createPaymentMethodCommandAction(request as CreatePaymentMethodRequest),
    onSuccess: () => {
      toast.success('支払い方法を追加しました')
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '追加に失敗しました')
    },
  })
}
