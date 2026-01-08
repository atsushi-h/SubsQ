import 'server-only'

import { getSessionServer } from '@/features/auth/servers/auth.server'

export async function checkAuthAndRefreshServer(): Promise<boolean> {
  const session = await getSessionServer()
  return Boolean(session?.user?.id)
}
