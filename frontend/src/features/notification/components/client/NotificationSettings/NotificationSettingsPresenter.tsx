'use client'

import { AlertCircle, Bell, BellOff } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Switch } from '@/shared/components/ui/switch'

type Props = {
  isSupported: boolean
  isSubscribed: boolean
  isToggling: boolean
  isSendingTest: boolean
  permission: NotificationPermission
  error: string | null
  onToggle: () => void
  onSendTest: () => void
}

export function NotificationSettingsPresenter({
  isSupported,
  isSubscribed,
  isToggling,
  isSendingTest,
  permission,
  error,
  onToggle,
  onSendTest,
}: Props) {
  if (!isSupported) {
    return (
      <div className="space-y-2">
        <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-200">通知</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          このブラウザはWeb Push通知に対応していません。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-200">通知</h2>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {permission === 'denied' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ブラウザの設定で通知がブロックされています。ブラウザの設定から許可してください。
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
          ) : (
            <BellOff className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          )}
          <span className="text-sm text-zinc-700 dark:text-zinc-200">通知を受け取る</span>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={onToggle}
          disabled={isToggling || permission === 'denied'}
        />
      </div>

      {isSubscribed && (
        <Button variant="outline" size="sm" onClick={onSendTest} disabled={isSendingTest}>
          {isSendingTest ? '送信中...' : '通知テスト'}
        </Button>
      )}
    </div>
  )
}
