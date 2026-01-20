'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation'
import { useSubscriptionDetailQuery } from '@/features/subscription/hooks/useSubscriptionDetailQuery'

export function useSubscriptionDetail(subscriptionId: string) {
  const router = useRouter()
  const { data: subscription, isLoading, error } = useSubscriptionDetailQuery(subscriptionId)
  const deleteMutation = useDeleteSubscriptionMutation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleBack = useCallback(() => {
    router.push('/subscriptions')
  }, [router])

  const handleEdit = useCallback(() => {
    router.push(`/subscriptions/${subscriptionId}/edit`)
  }, [subscriptionId, router])

  const handleDeleteRequest = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    deleteMutation.mutate(subscriptionId, {
      onSuccess: () => {
        router.push('/subscriptions')
      },
    })
  }, [subscriptionId, deleteMutation, router])

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteConfirm(false)
  }, [])

  return {
    subscription,
    isLoading,
    error,
    isDeleting: deleteMutation.isPending,
    showDeleteConfirm,
    handleBack,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
