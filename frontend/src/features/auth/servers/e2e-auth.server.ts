import 'server-only'
import { isDevelopment } from '@/shared/lib/env'

/**
 * E2E認証が有効かチェック（クライアントコンポーネント用）
 * 環境変数の存在チェックはサーバー側で行い、真偽値のみを返す
 */
export function checkE2EAuthEnabledServer(): boolean {
  if (!isDevelopment()) {
    return false
  }
  return Boolean(process.env.E2E_TEST_PASSWORD)
}
