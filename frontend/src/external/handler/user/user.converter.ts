import type { ModelsUserResponse } from '@/external/client/api/generated/model'
import { type UserResponse, UserResponseSchema } from '../../dto/user.dto'

export function toUserResponse(model: ModelsUserResponse): UserResponse {
  return UserResponseSchema.parse(model)
}
