import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// テスト環境用の環境変数を設定
process.env.SKIP_ENV_VALIDATION = 'true'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_APP_ENV = 'dev'
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080'

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
