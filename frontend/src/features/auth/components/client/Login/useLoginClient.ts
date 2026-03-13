'use client'

import { getSignInUrl } from '@/features/auth/lib/auth-client'

export function useLoginClient() {
  const handleGoogleLogin = () => {
    window.location.href = getSignInUrl()
  }

  return {
    handleGoogleLogin,
  }
}
