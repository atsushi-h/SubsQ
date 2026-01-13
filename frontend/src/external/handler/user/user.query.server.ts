import 'server-only'

import {
  type GetUserByEmailRequest,
  GetUserByEmailRequestSchema,
  type GetUserByIdRequest,
  GetUserByIdRequestSchema,
  type UserResponse,
} from '../../dto/user.dto'
import { userService } from '../../service/user/user.service'
import { toUserResponse } from './user.converter'

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
