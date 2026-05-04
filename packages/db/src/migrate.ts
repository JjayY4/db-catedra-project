import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { applyTriggers } from './schema/triggers'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const db = drizzle(pool)

  try {
    console.log('Running migrations...')
    await migrate(db, { migrationsFolder: './src/migrations' })

    console.log('Applying triggers...')
    await applyTriggers(db)

    console.log('Applying stored procedures & views...')
    const spSql = readFileSync(resolve(__dirname, 'sql/03_stored_procedures.sql'), 'utf-8')
    await pool.query(spSql)
    const viewsSql = readFileSync(resolve(__dirname, 'sql/01_views.sql'), 'utf-8')
    await pool.query(viewsSql)

    console.log('Done.')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
