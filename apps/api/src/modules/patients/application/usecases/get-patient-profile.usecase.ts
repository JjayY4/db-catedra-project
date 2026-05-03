import { injectable } from 'inversify'
import { eq } from 'drizzle-orm'
import { db } from '@project/db/src/client'
import { PatientFullRecordView } from '@project/db/src/schema/views'
import { AppError } from '~/common/errors/app-error'

@injectable()
export class GetPatientProfileUseCase {
  async execute(dui: string) {
    const [row] = await db
      .select()
      .from(PatientFullRecordView)
      .where(eq(PatientFullRecordView.dui, dui))
      .limit(1)

    if (!row) throw new AppError('Paciente no encontrado', 404)
    return row
  }
}
