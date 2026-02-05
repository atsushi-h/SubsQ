'use client'

import { SettingsContentPresenter } from './SettingsContentPresenter'
import { useSettingsContent } from './useSettingsContent'

type Props = {
  userEmail: string
}

export function SettingsContentContainer({ userEmail }: Props) {
  const { isDeleting, handleDeleteAccount } = useSettingsContent()

  return (
    <SettingsContentPresenter
      userEmail={userEmail}
      isDeleting={isDeleting}
      onDeleteAccount={handleDeleteAccount}
    />
  )
}
