'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { useDeletePaymentMethodMutation } from '@/features/payment-method/hooks/useDeletePaymentMethodMutation'
import { usePaymentMethodListQuery } from '@/features/payment-method/hooks/usePaymentMethodListQuery'
import type { PaymentMethodWithUsage } from '@/features/payment-method/types/payment-method.types'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'

export function usePaymentMethodList() {
  const router = useRouter()
  const { data: paymentMethods, isLoading, error } = usePaymentMethodListQuery()
  const { data: subscriptionData } = useSubscriptionListQuery()
  const deleteMutation = useDeletePaymentMethodMutation()
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodWithUsage | null>(null)

  // 使用中件数を計算
  const paymentMethodsWithUsage = useMemo<PaymentMethodWithUsage[]>(() => {
    if (!paymentMethods || !subscriptionData?.subscriptions) return []

    return paymentMethods.map((pm) => ({
      ...pm,
      usageCount: subscriptionData.subscriptions.filter((sub) => sub.paymentMethod?.id === pm.id)
        .length,
    }))
  }, [paymentMethods, subscriptionData])

  const handleCreate = useCallback(() => {
    router.push('/payment-methods/new')
  }, [router])

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/payment-methods/${id}/edit`)
    },
    [router],
  )

  const handleDeleteRequest = useCallback((paymentMethod: PaymentMethodWithUsage) => {
    setDeleteTarget(paymentMethod)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null)
        },
      })
    }
  }, [deleteTarget, deleteMutation])

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  return {
    paymentMethods: paymentMethodsWithUsage,
    isLoading,
    error,
    isDeleting: deleteMutation.isPending,
    deleteTarget,
    handleCreate,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
