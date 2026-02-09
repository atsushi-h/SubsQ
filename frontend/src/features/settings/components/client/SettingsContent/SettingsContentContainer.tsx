'use client'

import { SettingsContentPresenter } from './SettingsContentPresenter'
import { useSettingsContent } from './useSettingsContent'

type Props = {
  userEmail: string
}

export function SettingsContentContainer({ userEmail }: Props) {
  const {
    isDeleting,
    isDialogOpen,
    error,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useSettingsContent()

  return (
    <SettingsContentPresenter
      userEmail={userEmail}
      isDeleting={isDeleting}
      isDialogOpen={isDialogOpen}
      error={error}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  )
}
