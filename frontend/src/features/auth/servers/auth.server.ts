import 'server-only'

import { headers } from 'next/headers'
import { auth } from '@/features/auth/lib/better-auth'

export async function getSessionServer() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}
