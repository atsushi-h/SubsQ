'use client'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

type Props = {
  onSubmit: (email: string, password: string) => void
  isLoading: boolean
  error: string | null
}

export function E2ELoginPresenter({ onSubmit, isLoading, error }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    onSubmit(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">SubsQ</h1>
          <p className="mt-2 text-sm text-muted-foreground">シンプルなサブスク管理アプリ</p>
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
            🔧 開発環境 - E2Eテスト用
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="e2e-login-form">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e2e-test@example.com"
              required
              disabled={isLoading}
              data-testid="e2e-email-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="テスト用パスワード"
              required
              disabled={isLoading}
              data-testid="e2e-password-input"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" data-testid="e2e-login-error">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            data-testid="e2e-login-button"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </div>
    </div>
  )
}
