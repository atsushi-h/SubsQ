import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '@/shared/lib/env'
import * as schema from './schema'

// Singleton pattern for database connection
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
  drizzle: NodePgDatabase<typeof schema> | undefined
}

if (!globalForDb.pool) {
  globalForDb.pool = new Pool({
    connectionString: env.DATABASE_URL,
  })
}

if (!globalForDb.drizzle) {
  globalForDb.drizzle = drizzle(globalForDb.pool, { schema })
}

export const db = globalForDb.drizzle

export type Database = typeof db
