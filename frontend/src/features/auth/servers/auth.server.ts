import 'server-only'

import { headers } from 'next/headers'
import { auth } from '@/features/auth/lib/better-auth'

export async function getSessionServer() {
  console.log('[getSessionServer] called:', new Date().toISOString())
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  console.log(
    '[getSessionServer] result:',
    session ? 'session found' : 'NULL',
    new Date().toISOString(),
  )
  return session
}
