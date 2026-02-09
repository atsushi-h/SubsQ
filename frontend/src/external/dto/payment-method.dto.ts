import { z } from 'zod'

// Request schemas
export const CreatePaymentMethodRequestSchema = z.object({
  userId: z.uuid(),
  name: z.string().min(1).max(100),
})

export const UpdatePaymentMethodRequestSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100),
})

export const GetPaymentMethodByIdRequestSchema = z.object({
  id: z.uuid(),
})

export const GetPaymentMethodsByUserIdRequestSchema = z.object({
  userId: z.uuid(),
})

// Response schemas
export const PaymentMethodResponseSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

// Type exports
export type CreatePaymentMethodRequest = z.infer<typeof CreatePaymentMethodRequestSchema>
export type UpdatePaymentMethodRequest = z.infer<typeof UpdatePaymentMethodRequestSchema>
export type GetPaymentMethodByIdRequest = z.infer<typeof GetPaymentMethodByIdRequestSchema>
export type GetPaymentMethodsByUserIdRequest = z.infer<
  typeof GetPaymentMethodsByUserIdRequestSchema
>
export type PaymentMethodResponse = z.infer<typeof PaymentMethodResponseSchema>
export type CreatePaymentMethodResponse = PaymentMethodResponse
export type UpdatePaymentMethodResponse = PaymentMethodResponse
