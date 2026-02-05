'use client'

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'

type Props = {
  userEmail: string
  isDeleting: boolean
  isDialogOpen: boolean
  error: string | null
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

export function SettingsContentPresenter({
  userEmail,
  isDeleting,
  isDialogOpen,
  error,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
}: Props) {
  return (
    <>
      <div className="space-y-6">
        {/* ページタイトル */}
        <h1 className="text-2xl font-bold text-zinc-700 dark:text-zinc-200">設定</h1>

        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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
            onClick={onDeleteRequest}
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

      {/* 退会確認ダイアログ */}
      <AlertDialog open={isDialogOpen} onOpenChange={onDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>本当に退会しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。すべてのサブスクリプションデータ、支払い方法、アカウント情報が完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onDeleteCancel}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              退会する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
