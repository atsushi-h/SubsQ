import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// テスト環境用の環境変数を設定
process.env.SKIP_ENV_VALIDATION = 'true'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_APP_ENV = 'dev'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.BETTER_AUTH_SECRET = 'test-secret-32-characters-long-test'
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret'
process.env.BETTER_AUTH_URL = 'http://localhost:3000/api/auth'

afterEach(() => {
  cleanup()
})

// server-onlyのモック
vi.mock('server-only', () => ({}))

// Next.js App Routerのモック
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
