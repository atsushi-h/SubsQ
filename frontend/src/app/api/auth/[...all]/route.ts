import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/features/auth/lib/better-auth'

const { GET: originalGET, POST: originalPOST } = toNextJsHandler(auth)

export const GET = async (req: Request) => {
  const url = new URL(req.url)

  if (url.pathname === '/api/auth/get-session') {
    const cookieHeader = req.headers.get('cookie') || ''
    const hasSessionToken = cookieHeader.includes('better-auth.session_token')
    const hasSessionData = cookieHeader.includes('better-auth.session_data')

    console.log('[auth-route] get-session request', {
      hasSessionToken,
      hasSessionData,
      cookieCount: cookieHeader.split(';').filter(Boolean).length,
    })

    const res = await originalGET(req)

    const setCookies = res.headers.getSetCookie?.() || []
    const deletedCookies = setCookies.filter(c => c.includes('Max-Age=0'))

    console.log('[auth-route] get-session response', {
      status: res.status,
      bodySize: res.headers.get('content-length'),
      deletedCookies: deletedCookies.length,
    })

    return res
  }

  return originalGET(req)
}

export const POST = originalPOST