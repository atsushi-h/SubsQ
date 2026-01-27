'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { deletePaymentMethodCommandAction } from '@/external/handler/payment-method/payment-method.command.action'
import { paymentMethodKeys } from '@/features/payment-method/queries/payment-method.query-keys'

export function useDeletePaymentMethodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethodId: string) => deletePaymentMethodCommandAction(paymentMethodId),
    onSuccess: () => {
      toast.success('支払い方法を削除しました')
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error(error.message || '削除に失敗しました')
    },
  })
}
