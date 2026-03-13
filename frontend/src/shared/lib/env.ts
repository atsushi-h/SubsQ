import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // E2Eテスト用（開発環境のみ）
    E2E_TEST_PASSWORD: z.string().optional(),
    PLAYWRIGHT_E2E_MODE: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string(),
    NEXT_PUBLIC_APP_ENV: z.enum(['dev', 'prd']).default('dev'),
    NEXT_PUBLIC_CONTACT_FORM_URL: z
      .string()
      .url('NEXT_PUBLIC_CONTACT_FORM_URL must be a valid URL'),
    NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  },

  runtimeEnv: {
    E2E_TEST_PASSWORD: process.env.E2E_TEST_PASSWORD,
    PLAYWRIGHT_E2E_MODE: process.env.PLAYWRIGHT_E2E_MODE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_CONTACT_FORM_URL: process.env.NEXT_PUBLIC_CONTACT_FORM_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // ビルド時は検証をスキップ、ランタイムでは検証を実行
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  emptyStringAsUndefined: true,
})

/**
 * 環境値の型定義
 * 他のモジュールで環境値を型安全に扱うためにエクスポート
 */
export type AppEnv = typeof env.NEXT_PUBLIC_APP_ENV

/**
 * 環境判定ヘルパー
 */
export const isProduction = () => env.NEXT_PUBLIC_APP_ENV === 'prd'
export const isDevelopment = () => env.NEXT_PUBLIC_APP_ENV === 'dev'
