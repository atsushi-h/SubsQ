'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { deleteUserAccountCommandAction } from '@/external/handler/user/user.command.action'
import { signOut } from '@/features/auth/lib/better-auth-client'

export function useDeleteUserAccountMutation() {
  const router = useRouter()

  return useMutation({
    mutationFn: deleteUserAccountCommandAction,
    onSuccess: async () => {
      // Phase 2: クリーンアップ（削除成功後）
      // signOutが失敗してもログインページへ遷移
      try {
        await signOut()
      } catch (signOutErr) {
        console.error('ログアウト処理に失敗しましたが、アカウントは削除されました', signOutErr)
      }

      // 削除成功後は必ずログインページへ遷移
      router.push('/login')
    },
  })
}
