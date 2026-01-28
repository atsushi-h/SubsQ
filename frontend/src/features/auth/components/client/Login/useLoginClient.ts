'use client'

import { signIn } from '@/features/auth/lib/better-auth-client'

export function useLoginClient() {
  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: '/subscriptions',
    })
  }

  return {
    handleGoogleLogin,
  }
}
