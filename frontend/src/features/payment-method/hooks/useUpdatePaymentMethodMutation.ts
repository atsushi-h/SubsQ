'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { UpdatePaymentMethodRequest } from '@/external/dto/payment-method.dto'
import { updatePaymentMethodCommandAction } from '@/external/handler/payment-method/payment-method.command.action'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'

export function useUpdatePaymentMethodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdatePaymentMethodRequest) => updatePaymentMethodCommandAction(request),
    onSuccess: (_, variables) => {
      toast.success('支払い方法を更新しました')
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.detail(variables.id) })
    },
    onError: (error: Error) => {
      toast.error(error.message || '更新に失敗しました')
    },
  })
}
