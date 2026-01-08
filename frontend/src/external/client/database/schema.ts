import { relations, sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

// ===========================================
// Users テーブル（独自定義）
// ===========================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    thumbnail: text('thumbnail'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    uniqueIndex('users_provider_account_idx').on(table.provider, table.providerAccountId),
  ],
)

// ===========================================
// Payment Methods テーブル
// ===========================================

export const paymentMethods = pgTable(
  'payment_methods',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [index('payment_methods_user_id_idx').on(table.userId)],
)

// ===========================================
// Subscriptions テーブル
// ===========================================

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    serviceName: text('service_name').notNull(),
    amount: integer('amount').notNull(),
    billingCycle: text('billing_cycle').notNull(),
    baseDate: integer('base_date').notNull(),
    paymentMethodId: uuid('payment_method_id').references(() => paymentMethods.id, {
      onDelete: 'restrict',
    }),
    memo: text('memo'),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => [
    index('subscriptions_user_id_idx').on(table.userId),
    index('subscriptions_payment_method_id_idx').on(table.paymentMethodId),
    check('amount_check', sql`${table.amount} >= 0 AND ${table.amount} <= 1000000`),
    check('billing_cycle_check', sql`${table.billingCycle} IN ('monthly', 'yearly')`),
  ],
)

// ===========================================
// Relations
// ===========================================

export const usersRelations = relations(users, ({ many }) => ({
  paymentMethods: many(paymentMethods),
  subscriptions: many(subscriptions),
}))

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
  subscriptions: many(subscriptions),
}))

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [subscriptions.paymentMethodId],
    references: [paymentMethods.id],
  }),
}))

// ===========================================
// 型定義
// ===========================================

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type PaymentMethod = typeof paymentMethods.$inferSelect
export type NewPaymentMethod = typeof paymentMethods.$inferInsert

export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert

// ===========================================
// BillingCycle 型
// ===========================================

export const BillingCycle = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export type BillingCycleType = (typeof BillingCycle)[keyof typeof BillingCycle]
