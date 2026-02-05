'use client'

import { useEffect, useRef, useState } from 'react'

export function useSettingsContent() {
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
      // 要件: コンソール出力のみ（実際の削除処理は未実装）
      console.log('退会処理が呼び出されました')

      // TODO: 実際の削除処理を実装する際は以下のコードを使用
      // const result = await deleteUserAccountCommandAction()
      // if (!result.success) {
      //   throw new Error(result.error || '退会処理に失敗しました')
      // }

      // フィードバック用にローディング状態を解除
      timeoutRef.current = setTimeout(() => {
        setIsDeleting(false)
      }, 500)
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
