import { and, eq } from 'drizzle-orm'
import { db } from '../client/database'
import { users } from '../client/database/schema'
import { User, type UserId } from '../domain/entities/user'
import type { IUserRepository } from '../domain/repositories/user.repository.interface'
import type { Email } from '../domain/value-objects/email'
import type { DbClient } from './transaction-manager'

export class UserRepository implements IUserRepository {
  async findById(id: UserId): Promise<User | null> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1)

    const result = results[0]
    if (!result) return null

    return User.reconstruct({
      id: result.id,
      email: result.email,
      name: result.name,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async findByEmail(email: Email): Promise<User | null> {
    const results = await db.select().from(users).where(eq(users.email, email.getValue())).limit(1)

    const result = results[0]
    if (!result) return null

    return User.reconstruct({
      id: result.id,
      email: result.email,
      name: result.name,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async findByProviderAccount(provider: string, providerAccountId: string): Promise<User | null> {
    const results = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerAccountId, providerAccountId)))
      .limit(1)

    const result = results[0]
    if (!result) return null

    return User.reconstruct({
      id: result.id,
      email: result.email,
      name: result.name,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async save(user: User): Promise<User> {
    const data = user.toPlainObject()
    const now = Math.floor(Date.now() / 1000)

    const [result] = await db
      .insert(users)
      .values({
        id: data.id,
        email: data.email,
        name: data.name,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        thumbnail: data.thumbnail,
        createdAt: Math.floor(data.createdAt.getTime() / 1000),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: data.name,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          thumbnail: data.thumbnail ?? null,
          updatedAt: now,
        },
      })
      .returning()

    return User.reconstruct({
      id: result.id,
      email: result.email,
      name: result.name,
      provider: result.provider,
      providerAccountId: result.providerAccountId,
      thumbnail: result.thumbnail,
      createdAt: new Date(result.createdAt * 1000),
      updatedAt: new Date(result.updatedAt * 1000),
    })
  }

  async delete(id: UserId, client: DbClient = db): Promise<void> {
    await client.delete(users).where(eq(users.id, id))
  }

  async exists(id: UserId): Promise<boolean> {
    const results = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1)

    return results.length > 0
  }

  async existsByProviderAccount(provider: string, providerAccountId: string): Promise<boolean> {
    const results = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerAccountId, providerAccountId)))
      .limit(1)

    return results.length > 0
  }
}

export const userRepository = new UserRepository()
