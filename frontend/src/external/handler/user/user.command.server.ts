import 'server-only'

import {
  type CreateOrGetUserRequest,
  CreateOrGetUserRequestSchema,
  type CreateOrGetUserResponse,
  type UpdateUserRequest,
  UpdateUserRequestSchema,
  type UpdateUserResponse,
} from '../../dto/user.dto'
import { userService } from '../../service/user/user.service'
import { toUserResponse } from './user.converter'

/**
 * OAuth認証時に呼ばれるため、認証チェックなし
 * better-auth の onSuccess / customSession から呼ばれる
 */
export async function createOrGetUserCommand(
  request: CreateOrGetUserRequest,
): Promise<CreateOrGetUserResponse> {
  const validated = CreateOrGetUserRequestSchema.parse(request)

  const domainUser = await userService.createOrGet(
    validated.provider,
    validated.providerAccountId,
    validated,
  )

  return toUserResponse(domainUser)
}

export async function updateUserCommand(
  request: UpdateUserRequest,
  userId: string,
): Promise<UpdateUserResponse> {
  const validated = UpdateUserRequestSchema.parse(request)

  if (userId !== validated.id) {
    throw new Error('Forbidden: Can only update your own user profile')
  }

  const updatedUser = await userService.update(validated.id, validated)

  return toUserResponse(updatedUser)
}
