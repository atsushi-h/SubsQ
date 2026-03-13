import 'server-only'

import { redirect } from 'next/navigation'
import type { ModelsUserResponse } from '@/external/client/api/generated/model'

import { getSessionServer } from '@/features/auth/servers/auth.server'

/** 認証済みセッションの型（userが必須） */
export type AuthenticatedSession = { user: ModelsUserResponse }

export const requireAuthServer = async () => {
  const session = await getSessionServer()
  if (!session?.user?.id) {
    redirect('/login')
  }
}

export const getAuthenticatedSessionServer = async (): Promise<AuthenticatedSession> => {
  const session = await getSessionServer()
  if (!session?.user?.id) {
    redirect('/login')
  }
  // redirect()はneverを返すので、ここに到達した時点でuserは必ず存在
  return session as AuthenticatedSession
}

export const redirectIfAuthenticatedServer = async () => {
  const session = await getSessionServer()
  if (session?.user?.id) {
    redirect('/subscriptions')
  }
}
