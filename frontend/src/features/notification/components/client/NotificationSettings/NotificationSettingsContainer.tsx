'use client'

import { NotificationSettingsPresenter } from './NotificationSettingsPresenter'
import { useNotificationSettings } from './useNotificationSettings'

export function NotificationSettingsContainer() {
  const {
    isSupported,
    isSubscribed,
    isToggling,
    isSendingTest,
    permission,
    error,
    handleToggle,
    handleSendTest,
  } = useNotificationSettings()

  return (
    <NotificationSettingsPresenter
      isSupported={isSupported}
      isSubscribed={isSubscribed}
      isToggling={isToggling}
      isSendingTest={isSendingTest}
      permission={permission}
      error={error}
      onToggle={handleToggle}
      onSendTest={handleSendTest}
    />
  )
}
