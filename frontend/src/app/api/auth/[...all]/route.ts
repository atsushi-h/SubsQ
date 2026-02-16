import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth)

/**
 * デバッグログを追加するラッパー関数
 * - セキュリティ: クエリパラメータ（認可コード等）は含めず、pathnameのみをログ出力
 * - エラーハンドリング: 例外発生時もログを記録
 */
function withDebugLog(handler: (req: Request) => Promise<Response>, method: 'GET' | 'POST') {
  return async (req: Request) => {
    const url = new URL(req.url)
    console.log(`[auth-route] ${method}:`, url.pathname, new Date().toISOString())

    try {
      const response = await handler(req)
      console.log(`[auth-route] ${method} response:`, response.status, new Date().toISOString())
      return response
    } catch (error) {
      console.error(`[auth-route] ${method} error:`, error, new Date().toISOString())
      throw error
    }
  }
}

export const GET = withDebugLog(originalGET, 'GET')
export const POST = withDebugLog(originalPOST, 'POST')
