import { injectable } from 'inversify'
import { sql } from 'drizzle-orm'
import { db } from '@project/db/src/client'

@injectable()
export class CheckAvailabilityUseCase {
  async execute(date: string) {
    const result = await db.execute(sql`SELECT * FROM sp_check_availability(${date}::date)`)
    return result.rows
  }
}
