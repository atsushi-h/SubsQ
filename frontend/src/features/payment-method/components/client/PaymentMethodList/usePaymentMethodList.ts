'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
  const paymentMethodsWithUsage: PaymentMethodWithUsage[] =
    !paymentMethods || !subscriptionData?.subscriptions
      ? []
      : paymentMethods.map((pm) => ({
          ...pm,
          usageCount: subscriptionData.subscriptions.filter(
            (sub) => sub.paymentMethod?.id === pm.id,
          ).length,
        }))

  const handleCreate = () => {
    router.push('/payment-methods/new')
  }

  const handleEdit = (id: string) => {
    router.push(`/payment-methods/${id}/edit`)
  }

  const handleDeleteRequest = (paymentMethod: PaymentMethodWithUsage) => {
    setDeleteTarget(paymentMethod)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null)
        },
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

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
