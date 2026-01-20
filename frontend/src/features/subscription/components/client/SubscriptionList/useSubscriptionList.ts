'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useDeleteSubscriptionMutation } from '@/features/subscription/hooks/useDeleteSubscriptionMutation'
import { useSubscriptionListQuery } from '@/features/subscription/hooks/useSubscriptionListQuery'
import type { Subscription } from '@/features/subscription/types/subscription.types'

export function useSubscriptionList() {
  const router = useRouter()
  const { data, isLoading, error } = useSubscriptionListQuery()
  const deleteMutation = useDeleteSubscriptionMutation()
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null)

  const handleCreate = useCallback(() => {
    router.push('/subscriptions/new')
  }, [router])

  const handleView = useCallback(
    (id: string) => {
      router.push(`/subscriptions/${id}`)
    },
    [router],
  )

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/subscriptions/${id}/edit`)
    },
    [router],
  )

  const handleDeleteRequest = useCallback((subscription: Subscription) => {
    setDeleteTarget(subscription)
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
