import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import type { UserResponse } from '../../dto/user.dto'
import { userService } from '../../service/user/user.service'
import { toUserResponse } from './user.converter'

export async function getCurrentUserQuery(): Promise<UserResponse | null> {
  await requireAuthServer()
  const data = await userService.getCurrentUser()
  if (!data) return null
  return toUserResponse(data)
}
