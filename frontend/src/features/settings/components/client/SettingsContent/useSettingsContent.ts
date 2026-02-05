'use client'

import { useState } from 'react'

export function useSettingsContent() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeleteRequest = () => {
    setIsDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    setIsDeleting(true)
    setIsDialogOpen(false)

    // 要件: コンソール出力のみ（実際の削除処理は未実装）
    console.log('退会処理が呼び出されました')

    // フィードバック用にローディング状態を解除
    setTimeout(() => {
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
