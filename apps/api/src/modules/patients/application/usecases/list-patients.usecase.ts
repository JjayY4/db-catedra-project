import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { PatientOutput } from '../dtos/outputs/patient.output'

@injectable()
export class ListPatientsUseCase extends BaseUseCase<void, PatientOutput[]> {
  constructor(private readonly patients: IPatientsRepository) { super() }

  protected async handle(_input: void, tx: TxClient): Promise<PatientOutput[]> {
    const allPatients = await this.patients.findAll(tx)
    
    return allPatients.map(patient => ({
      dui:           patient.dui,
      userId:        patient.userId,
      firstName:     patient.firstName,
      lastName:      patient.lastName,
      whatsappPhone: patient.whatsappPhone,
      birthDate:     patient.birthDate,
      insuranceId:   patient.insuranceId,
      recordId:      patient.recordId,
    }))
  }
}