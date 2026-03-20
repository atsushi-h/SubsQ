import { z } from 'zod'

// Request schemas
export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1).optional(),
  thumbnail: z.string().nullable().optional(),
})

// Response schemas
export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  thumbnail: z.string().nullable().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

// Type exports
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type UpdateUserResponse = UserResponse
