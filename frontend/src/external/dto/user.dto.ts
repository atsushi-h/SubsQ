import { z } from 'zod'

// Request schemas
export const CreateUserRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  provider: z.string(),
  providerAccountId: z.string(),
  thumbnail: z.string().optional(),
})

export const CreateOrGetUserRequestSchema = CreateUserRequestSchema

export const UpdateUserRequestSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).optional(),
  thumbnail: z.string().nullable().optional(),
})

export const GetUserByIdRequestSchema = z.object({
  id: z.uuid(),
})

export const GetUserByEmailRequestSchema = z.object({
  email: z.email(),
})

// Response schemas
export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  thumbnail: z.string().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

// Type exports
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>
export type CreateOrGetUserRequest = z.infer<typeof CreateOrGetUserRequestSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
export type CreateOrGetUserResponse = UserResponse
export type UpdateUserResponse = UserResponse
export type GetUserByIdRequest = z.infer<typeof GetUserByIdRequestSchema>
export type GetUserByEmailRequest = z.infer<typeof GetUserByEmailRequestSchema>
