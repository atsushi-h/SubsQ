'use client'

import { useState } from 'react'
import { signIn } from '@/features/auth/lib/better-auth-client'

export function useE2ELogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleE2ELogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: '/subscriptions',
      })

      if (result?.error) {
        const errorMessage =
          result.error.message || 'メールアドレスまたはパスワードが正しくありません'
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(errorMessage)
      console.error('E2E login failed:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleE2ELogin,
    isLoading,
    error,
  }
}
