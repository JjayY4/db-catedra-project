import { injectable } from 'inversify'
import { sql } from 'drizzle-orm'
import { db } from '@project/db/src/client'

@injectable()
export class GetSlotsByDateUseCase {
  async execute(date: string) {
    const result = await db.execute(sql`SELECT * FROM sp_get_available_slots(${date}::date)`)
    return result.rows
  }
}
