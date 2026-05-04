import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { PaginatedPatientsOutput } from '../dtos/outputs/patient.output'

interface Input {
  page:      number
  pageSize:  number
  search?:   string
}

@injectable()
export class ListPatientsUseCase extends BaseUseCase<Input, PaginatedPatientsOutput> {
  constructor(private readonly patients: IPatientsRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<PaginatedPatientsOutput> {
    const { items, total } = await this.patients.findPaginated(input.page, input.pageSize, tx, input.search)
    return {
      items: items.map((p) => ({
        dui:               p.dui,
        userId:            p.userId,
        firstName:         p.firstName,
        lastName:          p.lastName,
        whatsappPhone:     p.whatsappPhone,
        birthDate:         p.birthDate,
        insuranceId:       p.insuranceId,
        recordId:          p.recordId,
        insuranceName:     p.insuranceName,
        insuranceCoverage: p.insuranceCoverage,
      })),
      total,
      page:     input.page,
      pageSize: input.pageSize,
    }
  }
}
