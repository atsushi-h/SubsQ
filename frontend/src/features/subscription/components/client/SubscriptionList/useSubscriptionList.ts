'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'
import type { Subscription } from '@/features/subscription/types/subscription.types'

export function useSubscriptionList() {
  const router = useRouter()
  const { data, isLoading, error } = useSubscriptionListQuery()
  const deleteMutation = useDeleteSubscriptionMutation()
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null)

  const handleCreate = () => {
    router.push('/subscriptions/new')
  }

  const handleView = (id: string) => {
    router.push(`/subscriptions/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/subscriptions/${id}/edit`)
  }

  const handleDeleteRequest = (subscription: Subscription) => {
    setDeleteTarget(subscription)
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
    subscriptions: data?.subscriptions ?? [],
    totals: data?.totals,
    isLoading,
    error,
    isDeleting: deleteMutation.isPending,
    deleteTarget,
    handleCreate,
    handleView,
    handleEdit,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
