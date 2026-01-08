import 'server-only'

import { getAuthenticatedSessionServer } from '@/features/auth/servers/redirect.server'

export async function withAuth<T>(handler: (ctx: { userId: string }) => Promise<T>): Promise<T> {
  const session = await getAuthenticatedSessionServer()
  if (!session.user?.id) {
    throw new Error('Unexpected: user should exist after authentication')
  }
  return handler({ userId: session.user.id })
}
