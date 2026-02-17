import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/subscriptions', '/payment-methods', '/settings']
// HTTPSとHTTPの両方のCookie名に対応
const SESSION_COOKIES = ['__Secure-better-auth.session_token', 'better-auth.session_token']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected) {
    const hasSessionToken = SESSION_COOKIES.some((cookie) => request.cookies.has(cookie))
    if (!hasSessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/subscriptions/:path*', '/payment-methods/:path*', '/settings/:path*'],
}
