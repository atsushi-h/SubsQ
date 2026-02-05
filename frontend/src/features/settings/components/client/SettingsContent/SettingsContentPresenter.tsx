'use client'

import { Button } from '@/shared/components/ui/button'

type Props = {
  userEmail: string
  isDeleting: boolean
  onDeleteAccount: () => void
}

export function SettingsContentPresenter({ userEmail, isDeleting, onDeleteAccount }: Props) {
  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <h1 className="text-2xl font-bold text-zinc-700 dark:text-zinc-200">設定</h1>

      {/* 区切り線 */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* アカウント情報セクション */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-700 dark:text-zinc-200">アカウント</h2>
        <div className="space-y-1">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">メールアドレス:</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-200">{userEmail}</p>
        </div>
      </div>

      {/* 区切り線 */}
      <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

      {/* 危険セクション */}
      <div className="space-y-4">
        <Button
          variant="destructive"
          onClick={onDeleteAccount}
          disabled={isDeleting}
          className="shadow-md"
        >
          {isDeleting ? '処理中...' : '退会する'}
        </Button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          退会すると、すべてのデータが削除され、元に戻せません。
        </p>
      </div>
    </div>
  )
}
