import 'server-only'

import { requireAuthServer } from '@/features/auth/servers/redirect.server'
import {
  type UpdateUserRequest,
  UpdateUserRequestSchema,
  type UpdateUserResponse,
} from '../../dto/user.dto'
import { userService } from '../../service/user/user.service'
import { toUserResponse } from './user.converter'

export async function updateUserCommand(request: UpdateUserRequest): Promise<UpdateUserResponse> {
  await requireAuthServer()
  const validated = UpdateUserRequestSchema.parse(request)

  const data = await userService.updateUser(validated)
  return toUserResponse(data)
}

export async function deleteUserAccountCommand(): Promise<void> {
  await requireAuthServer()
  await userService.deleteUser()
}
