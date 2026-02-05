'use client'

import { useEffect, useRef, useState } from 'react'

export function useSettingsContent() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
  }

  const handleDeleteConfirm = () => {
    setIsDeleting(true)
    setIsDialogOpen(false)

    // 要件: コンソール出力のみ（実際の削除処理は未実装）
    console.log('退会処理が呼び出されました')

    // フィードバック用にローディング状態を解除
    timeoutRef.current = setTimeout(() => {
      setIsDeleting(false)
    }, 500)
  }

  const handleDeleteCancel = () => {
    setIsDialogOpen(false)
  }

  return {
    isDeleting,
    isDialogOpen,
    handleDeleteRequest,
    handleDeleteConfirm,
    handleDeleteCancel,
  }
}
