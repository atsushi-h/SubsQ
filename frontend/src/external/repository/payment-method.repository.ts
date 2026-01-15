import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../client/database'
import { paymentMethods } from '../client/database/schema'
import { PaymentMethod, type PaymentMethodId, type UserId } from '../domain/entities/payment-method'
import type { Subscription } from '../domain/entities/subscription'
import type { IPaymentMethodRepository } from '../domain/repositories/payment-method.repository.interface'
import { subscriptionRepository } from './subscription.repository'
import type { DbClient } from './transaction.repository'

export class PaymentMethodRepository implements IPaymentMethodRepository {
  async findById(id: PaymentMethodId, client: DbClient = db): Promise<PaymentMethod | null> {
    const results = await client
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .limit(1)

    const result = results[0]
    if (!result) return null

    return PaymentMethod.reconstruct({
      id: result.id,
      userId: result.userId,
      name: result.name,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async findByUserId(userId: UserId): Promise<PaymentMethod[]> {
    const results = await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId))

    return results.map((result) =>
      PaymentMethod.reconstruct({
        id: result.id,
        userId: result.userId,
        name: result.name,
        createdAt: new Date(result.createdAt * 1000),
        updatedAt: new Date(result.updatedAt * 1000),
      }),
    )
  }

  async findIdsByUserId(userId: UserId): Promise<PaymentMethodId[]> {
    const results = await db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))

    return results.map((result) => result.id)
  }

  async save(paymentMethod: PaymentMethod): Promise<PaymentMethod> {
    const data = paymentMethod.toPlainObject()
    const now = Math.floor(Date.now() / 1000)

    const [result] = await db
      .insert(paymentMethods)
      .values({
        id: data.id,
        userId: data.userId,
        name: data.name,
        createdAt: Math.floor(data.createdAt.getTime() / 1000),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: paymentMethods.id,
        set: {
          name: data.name,
          updatedAt: now,
        },
      })
      .returning()

    return PaymentMethod.reconstruct({
      id: result.id,
      userId: result.userId,
      name: result.name,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async delete(id: PaymentMethodId, client: DbClient = db): Promise<void> {
    await client.delete(paymentMethods).where(eq(paymentMethods.id, id))
  }

  async deleteMany(ids: PaymentMethodId[], client: DbClient = db): Promise<void> {
    if (ids.length === 0) return

    await client.delete(paymentMethods).where(inArray(paymentMethods.id, ids))
  }

  async exists(id: PaymentMethodId): Promise<boolean> {
    const results = await db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .limit(1)

    return results.length > 0
  }

  async findByUserIdAndName(userId: UserId, name: string): Promise<PaymentMethod | null> {
    const results = await db
      .select()
      .from(paymentMethods)
      .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.name, name)))
      .limit(1)

    const result = results[0]
    if (!result) return null

    return PaymentMethod.reconstruct({
      id: result.id,
      userId: result.userId,
      name: result.name,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async getSubscriptionsForPaymentMethod(
    paymentMethodId: PaymentMethodId,
    client: DbClient = db,
  ): Promise<Subscription[]> {
    return subscriptionRepository.findByPaymentMethodId(paymentMethodId, client)
  }
}

export const paymentMethodRepository = new PaymentMethodRepository()
