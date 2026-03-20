import { type NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/subscriptions', '/payment-methods', '/settings']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected) {
    const hasSessionToken = request.cookies.has('subsq_token')
    if (!hasSessionToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/subscriptions/:path*', '/payment-methods/:path*', '/settings/:path*'],
}
