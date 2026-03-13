import 'server-only'

import { usersGetCurrentUser } from '@/external/client/api/generated/users/users'

export async function getSessionServer() {
  try {
    const res = await usersGetCurrentUser()
    if (res.status !== 200) return null
    return { user: res.data }
  } catch {
    return null
  }
}
