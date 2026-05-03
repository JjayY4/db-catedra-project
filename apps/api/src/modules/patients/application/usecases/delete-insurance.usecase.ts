import { injectable } from 'inversify'
import { count, eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { Patients } from '@project/db/src/schema/patients.schema'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'

@injectable()
export class DeleteInsuranceUseCase extends BaseUseCase<{ id: string }, void> {
  protected async handle({ id }: { id: string }, tx: TxClient): Promise<void> {
    const [{ value }] = await tx
      .select({ value: count() })
      .from(Patients)
      .where(eq(Patients.insuranceId, id))
    if (value > 0)
      throw new AppError(
        `No se puede eliminar: ${value} paciente${value !== 1 ? 's' : ''} está${value !== 1 ? 'n' : ''} vinculado${value !== 1 ? 's' : ''} a esta aseguradora`,
        422,
      )
    await tx.delete(MedicalInsurances).where(eq(MedicalInsurances.id, id))
  }
}
