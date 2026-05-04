import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { auth } from '@project/auth/src/auth'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import { IPatientsRepository } from '~/modules/patients/domain/interfaces/patients.repository'
import type { CreateUserInput } from '../dtos/inputs/create-user.input'
import type { UserOutput } from '../dtos/outputs/user.output'

@injectable()
export class CreateUserUseCase extends BaseUseCase<CreateUserInput, UserOutput> {
  constructor(
    private readonly users:    IUsersRepository,
    private readonly patients: IPatientsRepository,
  ) { super() }

  protected async handle(input: CreateUserInput, tx: TxClient): Promise<UserOutput> {
    const existing = await this.users.findByEmail(input.email, tx)
    if (existing) throw new AppError('Email already registered', 409)

    await auth.api.signUpEmail({
      body: {
        email:    input.email,
        password: input.password,
        name:     input.name,
      },
    })

    const created = await this.users.findByEmail(input.email, tx)
    if (!created) throw new AppError('Failed to create user', 500)

    const user = await this.users.updateRole(created.id, input.role, tx)

    if (input.patientDui) {
      const patient = await this.patients.findById(input.patientDui, tx)
      if (!patient) throw new AppError('Paciente no encontrado', 404)
      if (patient.userId) throw new AppError('Este paciente ya tiene una cuenta vinculada', 409)
      await this.patients.linkUser(input.patientDui, user.id, tx)
    }

    return {
      id:            user.id,
      email:         user.email,
      name:          user.name,
      role:          user.role,
      accountStatus: user.accountStatus,
      createdAt:     user.createdAt,
    }
  }
}
