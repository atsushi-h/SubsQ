'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation'
import { useSubscriptionDetailQuery } from '@/features/subscription/hooks/useSubscriptionDetailQuery'

export function useSubscriptionDetail(subscriptionId: string) {
  const router = useRouter()
  const { data: subscription, isLoading, error } = useSubscriptionDetailQuery(subscriptionId)
  const deleteMutation = useDeleteSubscriptionMutation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleBack = () => {
    router.push('/subscriptions')
  }

  const handleEdit = () => {
    router.push(`/subscriptions/${subscriptionId}/edit`)
  }

  const handleDeleteRequest = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(subscriptionId, {
      onSuccess: () => {
        router.push('/subscriptions')
      },
    })
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

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
