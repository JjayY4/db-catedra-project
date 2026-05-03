import { injectable } from 'inversify'
import { sql } from 'drizzle-orm'
import { db } from '@project/db/src/client'

@injectable()
export class GetPatientHistoryByDuiUseCase {
  async execute(dui: string) {
    const result = await db.execute(sql`SELECT * FROM sp_get_patient_history(${dui})`)
    return result.rows
  }
}
