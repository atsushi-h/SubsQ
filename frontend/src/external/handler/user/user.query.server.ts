import 'server-only'

import type { User } from '../../domain/entities/user'
import {
  type GetUserByEmailRequest,
  GetUserByEmailRequestSchema,
  type GetUserByIdRequest,
  GetUserByIdRequestSchema,
  type UserResponse,
  UserResponseSchema,
} from '../../dto/user.dto'
import { userService } from '../../service/user/user.service'

function toUserResponse(user: User): UserResponse {
  const plainUser = user.toPlainObject()
  const response = {
    id: plainUser.id,
    email: plainUser.email,
    name: plainUser.name,
    thumbnail: plainUser.thumbnail,
    createdAt: plainUser.createdAt.toISOString(),
    updatedAt: plainUser.updatedAt.toISOString(),
  }

  return UserResponseSchema.parse(response)
}

export async function getUserByIdQuery(request: GetUserByIdRequest): Promise<UserResponse | null> {
  const validated = GetUserByIdRequestSchema.parse(request)

  const user = await userService.getUserById(validated.id)
  if (!user) return null

  return toUserResponse(user)
}

export async function getUserByEmailQuery(
  request: GetUserByEmailRequest,
): Promise<UserResponse | null> {
  const validated = GetUserByEmailRequestSchema.parse(request)

  const user = await userService.getUserByEmail(validated.email)
  if (!user) return null

  return toUserResponse(user)
}

export async function getCurrentUserQuery(userId: string): Promise<UserResponse | null> {
  const user = await userService.getUserById(userId)
  if (!user) return null

  return toUserResponse(user)
}
