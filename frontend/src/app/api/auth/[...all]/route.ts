import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

const SESSION_COOKIE_NAME = '__Secure-better-auth.session_token'

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth)

/**
 * コールドスタート時のCookie破壊を防止する。
 *
 * Better Auth の get-session は検証失敗時に Set-Cookie: Max-Age=0 を返し、
 * ブラウザのCookieを削除する。コールドスタートで初期化未完了のまま
 * リクエストが処理されると、有効なtokenを「無効」と誤判定してCookieを破壊する。
 *
 * この関数は、リクエストに session_token があるのにレスポンスが空セッションの場合、
 * Set-Cookie ヘッダーを除去してブラウザのCookieを保護する。
 */
function stripCookieDeletionHeaders(response: Response): Response {
  const setCookieHeaders = response.headers.getSetCookie()

  if (!setCookieHeaders || setCookieHeaders.length === 0) {
    return response
  }

  const hasDeletionCookie = setCookieHeaders.some(
    (cookie) => cookie.includes('Max-Age=0') || cookie.includes('max-age=0')
  )

  if (!hasDeletionCookie) {
    return response
  }

  console.warn('[auth-route] Blocked cookie deletion headers (cold start protection)')

  const newHeaders = new Headers()
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() !== 'set-cookie') {
      newHeaders.set(key, value)
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}

export const GET = async (req: Request) => {
  const url = new URL(req.url)
  const isGetSession = url.pathname.endsWith('/get-session')
  const cookieHeader = req.headers.get('cookie') || ''
  const hasSessionToken = cookieHeader.includes(SESSION_COOKIE_NAME)

  console.log('[auth-route] GET:', url.pathname, new Date().toISOString())

  const response = await originalGET(req)

  console.log('[auth-route] GET response:', response.status, new Date().toISOString())

  if (isGetSession && hasSessionToken) {
    return stripCookieDeletionHeaders(response)
  }

  return response
}

export const POST = async (req: Request) => {
  const url = new URL(req.url)
  console.log('[auth-route] POST:', url.pathname, new Date().toISOString())
  const response = await originalPOST(req)
  console.log('[auth-route] POST response:', response.status, new Date().toISOString())
  return response
}
