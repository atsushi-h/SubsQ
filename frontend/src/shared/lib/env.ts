import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    BETTER_AUTH_URL: z.string(),
    // E2Eテスト用パスワード（開発環境でE2E認証を有効化する場合は必須）
    // 注意: isE2EAuthEnabled()がtrueの場合、このフィールドは必ず設定されている必要がある
    E2E_TEST_PASSWORD: z.string().optional(),
    // Playwright E2Eモードフラグ(テスト実行時のみtrueに設定)
    PLAYWRIGHT_E2E_MODE: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string(),
    NEXT_PUBLIC_APP_ENV: z.enum(['dev', 'prd']).default('dev'),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    E2E_TEST_PASSWORD: process.env.E2E_TEST_PASSWORD,
    PLAYWRIGHT_E2E_MODE: process.env.PLAYWRIGHT_E2E_MODE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
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

/**
 * E2E認証が有効かチェック
 * 開発環境かつE2E_TEST_PASSWORDとPLAYWRIGHT_E2E_MODEが両方設定されている場合のみtrue
 */
export const isE2EAuthEnabled = () =>
  isDevelopment() && Boolean(env.E2E_TEST_PASSWORD) && Boolean(env.PLAYWRIGHT_E2E_MODE)
