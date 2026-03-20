import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'

export async function withAuth<T>(handler: () => Promise<T>): Promise<T> {
  await requireAuthServer()
  return handler()
}
