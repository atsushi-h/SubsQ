import type { User } from '../../domain/entities/user'
import { type UserResponse, UserResponseSchema } from '../../dto/user.dto'

/**
 * User ドメインエンティティを UserResponse DTO に変換する
 */
export function toUserResponse(user: User): UserResponse {
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
