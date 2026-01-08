import 'server-only'

import { redirect } from 'next/navigation'

import { getSessionServer } from '@/features/auth/servers/auth.server'

/** 認証済みセッションの型（userが必須） */
export type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof getSessionServer>>>

export const requireAuthServer = async () => {
  const session = await getSessionServer()
  if (!session?.user?.id || session.error) {
    redirect('/login')
  }
}

export const getAuthenticatedSessionServer = async (): Promise<AuthenticatedSession> => {
  const session = await getSessionServer()
  if (!session?.user?.id || session.error) {
    redirect('/login')
  }
  // redirect()はneverを返すので、ここに到達した時点でuserは必ず存在
  return session as AuthenticatedSession
}

export const redirectIfAuthenticatedServer = async () => {
  const session = await getSessionServer()
  if (session?.user?.id && !session.error) {
    redirect('/subscriptions')
  }
}
