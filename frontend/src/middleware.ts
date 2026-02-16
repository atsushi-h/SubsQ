import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/subscriptions', '/payment-methods', '/settings']
const SESSION_COOKIE = '__Secure-better-auth.session_token'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/subscriptions/:path*', '/payment-methods/:path*', '/settings/:path*'],
}
