'use client'

import { useState } from 'react'

export function useE2ELogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleE2ELogin = async (_email: string, _password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Go Backend の E2E 認証エンドポイントが実装されたら更新する
      throw new Error('E2E認証は現在利用できません')
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
