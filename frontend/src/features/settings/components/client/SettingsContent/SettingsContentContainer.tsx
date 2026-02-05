'use client'

import { SettingsContentPresenter } from './SettingsContentPresenter'
import { useSettingsContent } from './useSettingsContent'

type Props = {
  userEmail: string
}

export function SettingsContentContainer({ userEmail }: Props) {
  const { isDeleting, isDialogOpen, handleDeleteRequest, handleDeleteConfirm, handleDeleteCancel } =
    useSettingsContent()

  return (
    <SettingsContentPresenter
      userEmail={userEmail}
      isDeleting={isDeleting}
      isDialogOpen={isDialogOpen}
      onDeleteRequest={handleDeleteRequest}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
    />
  )
}
