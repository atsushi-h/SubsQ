'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { deleteUserAccountCommandAction } from '@/external/handler/user/user.command.action'
import { signOut } from '@/features/auth/lib/better-auth-client'

export function useSettingsContent() {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // クリーンアップ: コンポーネントアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleDeleteRequest = () => {
    setIsDialogOpen(true)
    setError(null) // ダイアログを開く際にエラーをクリア
  }

  const handleDeleteConfirm = async () => {
    setError(null)
    setIsDeleting(true)
    setIsDialogOpen(false)

    try {
      // アカウント削除を実行
      await deleteUserAccountCommandAction()

      // 削除成功後、ログアウトしてログインページへリダイレクト
      await signOut()
      router.push('/login')
    } catch (err) {
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
