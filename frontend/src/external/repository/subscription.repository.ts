import { eq, inArray } from 'drizzle-orm'
import { db } from '../client/database'
import { subscriptions } from '../client/database/schema'
import { Subscription, type SubscriptionId, type UserId } from '../domain/entities/subscription'
import type { ISubscriptionRepository } from '../domain/repositories/subscription.repository.interface'
import { Amount, BaseDate, BillingCycle } from '../domain/value-objects'
import { paymentMethodRepository } from './payment-method.repository'

export class SubscriptionRepository implements ISubscriptionRepository {
  async findById(id: SubscriptionId): Promise<Subscription | null> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1)

    const result = results[0]
    if (!result) return null

    return Subscription.reconstruct({
      id: result.id,
      userId: result.userId,
      serviceName: result.serviceName,
      amount: Amount.fromValue(result.amount),
      billingCycle: BillingCycle.fromValue(result.billingCycle),
      baseDate: BaseDate.fromValue(result.baseDate),
      paymentMethodId: result.paymentMethodId,
      memo: result.memo ?? '',
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async findByUserId(userId: UserId): Promise<Subscription[]> {
    const results = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId))

    return results.map((result) =>
      Subscription.reconstruct({
        id: result.id,
        userId: result.userId,
        serviceName: result.serviceName,
        amount: Amount.fromValue(result.amount),
        billingCycle: BillingCycle.fromValue(result.billingCycle),
        baseDate: BaseDate.fromValue(result.baseDate),
        paymentMethodId: result.paymentMethodId,
        memo: result.memo ?? '',
        createdAt: new Date(result.createdAt * 1000),
        updatedAt: new Date(result.updatedAt * 1000),
      }),
    )
  }

  async findIdsByUserId(userId: UserId): Promise<SubscriptionId[]> {
    const results = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))

    return results.map((result) => result.id)
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const data = subscription.toPlainObject()
    const now = Math.floor(Date.now() / 1000)

    const [result] = await db
      .insert(subscriptions)
      .values({
        id: data.id,
        userId: data.userId,
        serviceName: data.serviceName,
        amount: data.amount,
        billingCycle: data.billingCycle,
        baseDate: data.baseDate,
        paymentMethodId: data.paymentMethodId,
        memo: data.memo,
        createdAt: Math.floor(data.createdAt.getTime() / 1000),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: subscriptions.id,
        set: {
          serviceName: data.serviceName,
          amount: data.amount,
          billingCycle: data.billingCycle,
          baseDate: data.baseDate,
          paymentMethodId: data.paymentMethodId,
          memo: data.memo,
          updatedAt: now,
        },
      })
      .returning()

    return Subscription.reconstruct({
      id: result.id,
      userId: result.userId,
      serviceName: result.serviceName,
      amount: Amount.fromValue(result.amount),
      billingCycle: BillingCycle.fromValue(result.billingCycle),
      baseDate: BaseDate.fromValue(result.baseDate),
      paymentMethodId: result.paymentMethodId,
      memo: result.memo ?? '',
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async delete(id: SubscriptionId): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id))
  }

  async deleteMany(ids: SubscriptionId[]): Promise<void> {
    if (ids.length === 0) return

    await db.delete(subscriptions).where(inArray(subscriptions.id, ids))
  }

  async exists(id: SubscriptionId): Promise<boolean> {
    const results = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.id, id))
      .limit(1)

    return results.length > 0
  }

  async findByPaymentMethodId(paymentMethodId: string): Promise<Subscription[]> {
    const results = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.paymentMethodId, paymentMethodId))

    return results.map((result) =>
      Subscription.reconstruct({
        id: result.id,
        userId: result.userId,
        serviceName: result.serviceName,
        amount: Amount.fromValue(result.amount),
        billingCycle: BillingCycle.fromValue(result.billingCycle),
        baseDate: BaseDate.fromValue(result.baseDate),
        paymentMethodId: result.paymentMethodId,
        memo: result.memo ?? '',
        createdAt: new Date(result.createdAt * 1000),
        updatedAt: new Date(result.updatedAt * 1000),
      }),
    )
  }

  async getPaymentMethodForSubscription(
    paymentMethodId: string | null,
  ): Promise<{ id: string; name: string } | null> {
    if (!paymentMethodId) return null

    const paymentMethod = await paymentMethodRepository.findById(paymentMethodId)
    if (!paymentMethod) return null

    return {
      id: paymentMethod.id,
      name: paymentMethod.name,
    }
  }
}

export const subscriptionRepository = new SubscriptionRepository()
