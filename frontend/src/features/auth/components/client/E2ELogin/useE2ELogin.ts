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
        setError('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (err) {
      setError('ログインに失敗しました')
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
