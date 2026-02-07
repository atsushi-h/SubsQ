'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteUserAccountCommandAction } from '@/external/handler/user/user.command.action'
import { signOut } from '@/features/auth/lib/better-auth-client'

export function useSettingsContent() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteRequest = () => {
    setIsDialogOpen(true)
    setError(null) // ダイアログを開く際にエラーをクリア
  }

  const handleDeleteConfirm = async () => {
    setError(null)
    setIsDeleting(true)
    setIsDialogOpen(false)

    try {
      // Phase 1: アカウント削除
      await deleteUserAccountCommandAction()

      // Phase 2: クリーンアップ（削除成功後）
      // signOutが失敗してもログインページへ遷移
      try {
        await signOut()
      } catch (signOutErr) {
        console.error('ログアウト処理に失敗しましたが、アカウントは削除されました', signOutErr)
      }

      // 削除成功後は必ずログインページへ遷移
      router.push('/login')
    } catch (err) {
      // アカウント削除に失敗した場合のみエラー表示
      setIsDeleting(false)
      setError(err instanceof Error ? err.message : '退会処理に失敗しました')
    }
  }

  const handleDeleteCancel = () => {
    setIsDialogOpen(false)
    setError(null) // キャンセル時にエラーをクリア
  }

  return {
    isDeleting,
    isDialogOpen,
    error,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
