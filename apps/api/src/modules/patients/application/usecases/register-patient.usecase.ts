import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { auth } from '@project/auth/src/auth'
import { UserRole } from '@project/enums/src/user-role.enum'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '~/modules/users/domain/interfaces/users.repository'
import { IPatientsRepository } from '../../domain/interfaces/patients.repository'
import type { RegisterPatientInput } from '../dtos/inputs/register-patient.input'
import type { PatientOutput } from '../dtos/outputs/patient.output'

@injectable()
export class RegisterPatientUseCase extends BaseUseCase<RegisterPatientInput, PatientOutput> {
  constructor(
    private readonly patients: IPatientsRepository,
    private readonly users:    IUsersRepository,
  ) { super() }

  protected async handle(input: RegisterPatientInput, tx: TxClient): Promise<PatientOutput> {
    const existingPatient = await this.patients.findById(input.dui, tx)
    if (existingPatient) throw new AppError('DUI ya registrado', 409)

    let userId: string | null = null

    if (input.email && input.password) {
      const existingUser = await this.users.findByEmail(input.email, tx)
      if (existingUser) throw new AppError('Email ya registrado', 409)

      await auth.api.signUpEmail({
        body: {
          email:    input.email,
          password: input.password,
          name:     `${input.firstName} ${input.lastName}`,
        },
      })

      const created = await this.users.findByEmail(input.email, tx)
      if (!created) throw new AppError('Failed to create user', 500)

      await this.users.updateRole(created.id, UserRole.Patient, tx)
      userId = created.id
    }

    const patient = await this.patients.create(input, userId, tx)

    return {
      dui:               patient.dui,
      userId:            patient.userId,
      firstName:         patient.firstName,
      lastName:          patient.lastName,
      whatsappPhone:     patient.whatsappPhone,
      birthDate:         patient.birthDate,
      insuranceId:       patient.insuranceId,
      recordId:          patient.recordId,
      insuranceName:     patient.insuranceName,
      insuranceCoverage: patient.insuranceCoverage,
    }
  }
}
