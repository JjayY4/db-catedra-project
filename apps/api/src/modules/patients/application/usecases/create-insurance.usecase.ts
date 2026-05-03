import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import type { InsuranceOutput } from '../dtos/outputs/insurance.output'
import type { CreateInsuranceInput } from '../dtos/inputs/insurance.input'

@injectable()
export class CreateInsuranceUseCase extends BaseUseCase<CreateInsuranceInput, InsuranceOutput> {
  protected async handle(input: CreateInsuranceInput, tx: TxClient): Promise<InsuranceOutput> {
    const [row] = await tx.insert(MedicalInsurances).values({
      insurerName:  input.insurerName,
      coverageType: input.coverageType,
    }).returning()
    return { id: row!.id, insurerName: row!.insurerName, coverageType: row!.coverageType }
  }
}
