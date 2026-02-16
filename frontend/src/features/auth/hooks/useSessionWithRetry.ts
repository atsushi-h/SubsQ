'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/features/auth/lib/better-auth-client'

const MAX_RETRIES = 3
const BASE_DELAY_MS = 2000

export function useSessionWithRetry() {
  const session = useSession()
  const router = useRouter()
  const retryCount = useRef(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (session.isPending || session.data?.user?.id) {
      if (isRetrying) setIsRetrying(false)
      return
    }

    // HTTPSとHTTPの両方のCookie名に対応
    const hasSessionToken =
      document.cookie.includes('better-auth.session_token') ||
      document.cookie.includes('__Secure-better-auth.session_token')

    if (!hasSessionToken) {
      router.replace('/login')
      return
    }

    if (retryCount.current < MAX_RETRIES) {
      setIsRetrying(true)
      const delay = BASE_DELAY_MS * (retryCount.current + 1)

      const timer = setTimeout(() => {
        retryCount.current += 1
        console.log(`[useSessionWithRetry] retry ${retryCount.current}/${MAX_RETRIES}`)
        session.refetch()
      }, delay)

      return () => clearTimeout(timer)
    }

    setIsRetrying(false)
    router.replace('/login')
  }, [session.isPending, session.data, router, session.refetch, isRetrying, session])

  return { ...session, isRetrying }
}
