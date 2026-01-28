'use client'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from '@/features/auth/lib/better-auth-client'

export function useHeader() {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await signOut()
    // キャッシュをすべてクリア
    queryClient.clear()
    router.push('/login')
  }

  return {
    userName: session?.user?.name || undefined,
    userEmail: session?.user?.email || undefined,
    // カスタムセッションのaccount.thumbnailを使用
    userImage: session?.account?.thumbnail || session?.user?.image || undefined,
    handleSignOut,
  }
}
