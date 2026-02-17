'use client'

import { useSessionWithRetry } from '@/features/auth/hooks/useSessionWithRetry'

type Props = {
  children: React.ReactNode
}

export function AuthRetryFallback({ children }: Props) {
  const { data, isRetrying, isPending } = useSessionWithRetry()

  if (isPending || isRetrying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-500">セッションを確認中...</p>
      </div>
    )
  }

  if (data?.user?.id) {
    return <>{children}</>
  }

  return null
}
