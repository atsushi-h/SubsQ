'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCurrentUserQuery } from '@/features/auth/hooks/useCurrentUserQuery'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 2000

export function useSessionWithRetry() {
  const { data: user, isPending, refetch } = useCurrentUserQuery()
  const router = useRouter()
  const retryCount = useRef(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (isPending || user) {
      if (isRetrying) setIsRetrying(false)
      return
    }

    const hasSessionToken = document.cookie.includes('subsq_token')

    if (!hasSessionToken) {
      router.replace('/login')
      return
    }

    if (retryCount.current < MAX_RETRIES) {
      setIsRetrying(true)
      const delay = BASE_DELAY_MS * (retryCount.current + 1)

      const timer = setTimeout(() => {
        retryCount.current += 1
        refetch()
      }, delay)

      return () => clearTimeout(timer)
    }

    setIsRetrying(false)
    router.replace('/login')
  }, [isPending, user, router, refetch, isRetrying])

  return {
    data: user ? { user } : null,
    isPending,
    isRetrying,
    refetch,
  }
}
