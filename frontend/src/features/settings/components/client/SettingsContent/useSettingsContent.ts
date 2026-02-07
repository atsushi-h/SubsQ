'use client'

import { useState } from 'react'
import { useDeleteUserAccountMutation } from '@/features/settings/hooks/useDeleteUserAccountMutation'

export function useSettingsContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const deleteAccountMutation = useDeleteUserAccountMutation()

  const handleDeleteRequest = () => {
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    setIsDialogOpen(false)
    deleteAccountMutation.mutate()
  }

  const handleDeleteCancel = () => {
    setIsDialogOpen(false)
  }

  return {
    isDeleting: deleteAccountMutation.isPending,
    isDialogOpen,
    error: deleteAccountMutation.error?.message || null,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
