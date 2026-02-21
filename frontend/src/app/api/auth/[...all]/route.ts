import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

// Next.js App RouterのGET Route Handlerはデフォルトで静的にキャッシュされるため、
// セッション状態の変化を即座に反映するために常に動的に実行する
export const dynamic = 'force-dynamic'

export const { GET, POST } = toNextJsHandler(auth)
