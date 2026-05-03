import { injectable } from 'inversify'
import { eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import type { InsuranceOutput } from '../dtos/outputs/insurance.output'
import type { UpdateInsuranceInput } from '../dtos/inputs/insurance.input'

interface Input extends UpdateInsuranceInput {
  id: string
}

@injectable()
export class UpdateInsuranceUseCase extends BaseUseCase<Input, InsuranceOutput> {
  protected async handle({ id, ...patch }: Input, tx: TxClient): Promise<InsuranceOutput> {
    const [row] = await tx
      .update(MedicalInsurances)
      .set(patch)
      .where(eq(MedicalInsurances.id, id))
      .returning()
    if (!row) throw new AppError('Aseguradora no encontrada', 404)
    return { id: row.id, insurerName: row.insurerName, coverageType: row.coverageType }
  }
}
