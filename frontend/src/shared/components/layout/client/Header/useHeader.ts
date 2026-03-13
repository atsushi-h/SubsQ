'use client'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { useCurrentUserQuery } from '@/features/auth/hooks/useCurrentUserQuery'
import { signOut } from '@/features/auth/lib/auth-client'
import { clearServiceWorkerCache } from '@/shared/lib/clearServiceWorkerCache'

export function useHeader() {
  const { data: user } = useCurrentUserQuery()
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    await signOut()

    // TanStack Queryキャッシュをクリア
    queryClient.clear()

    // Service Workerキャッシュをクリア（セキュリティ対策）
    await clearServiceWorkerCache()

    router.push('/login')
  }

  return {
    userName: user?.name || undefined,
    userEmail: user?.email || undefined,
    userImage: user?.thumbnail || undefined,
    handleSignOut,
    pathname,
  }
}
