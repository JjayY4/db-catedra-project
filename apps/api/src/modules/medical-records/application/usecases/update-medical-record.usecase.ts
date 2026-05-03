import { injectable } from 'inversify'
import { eq } from 'drizzle-orm'
import { db } from '@project/db/src/client'
import { MedicalRecords } from '@project/db/src/schema/medical-records.schema'
import type { BloodType } from '@project/db/src/schema/enums'
import { AppError } from '~/common/errors/app-error'
import type { UpdateMedicalRecordInput } from '../dtos/inputs/update-medical-record.input'

@injectable()
export class UpdateMedicalRecordUseCase {
  async execute(recordId: string, input: UpdateMedicalRecordInput): Promise<void> {
    const [existing] = await db
      .select({ id: MedicalRecords.id })
      .from(MedicalRecords)
      .where(eq(MedicalRecords.id, recordId))
      .limit(1)

    if (!existing) throw new AppError('Expediente no encontrado', 404)

    await db.update(MedicalRecords)
      .set({
        ...(input.bloodType         !== undefined && { bloodType:         input.bloodType as BloodType | null }),
        ...(input.knownAllergies    !== undefined && { knownAllergies:    input.knownAllergies }),
        ...(input.familyHistory     !== undefined && { familyHistory:     input.familyHistory }),
        ...(input.chronicConditions !== undefined && { chronicConditions: input.chronicConditions }),
      })
      .where(eq(MedicalRecords.id, recordId))
  }
}
