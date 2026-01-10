import * as dotenv from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Import env AFTER dotenv loads variables
import { env } from '@/shared/lib/env'

async function runMigrations() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  })

  const db = drizzle(pool)

  console.log('⏳ Running migrations...')

  try {
    await migrate(db, { migrationsFolder: 'drizzle' })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await pool.end()
  }
}

runMigrations().catch((err) => {
  console.error(err)
  process.exit(1)
})
