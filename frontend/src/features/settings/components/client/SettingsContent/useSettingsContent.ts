'use client'

import { useState } from 'react'

export function useSettingsContent() {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = () => {
    setIsDeleting(true)

    // 要件: コンソール出力のみ（実際の削除処理は未実装）
    console.log('退会処理が呼び出されました')

    // フィードバック用にローディング状態を解除
    setTimeout(() => {
      setIsDeleting(false)
    }, 500)
  }

  return {
    isDeleting,
    handleDeleteAccount,
  }
}
