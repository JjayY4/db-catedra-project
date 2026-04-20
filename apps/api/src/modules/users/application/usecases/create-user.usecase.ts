import { injectable } from 'inversify'
import { createHash } from 'crypto'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { CreateUserInput } from '../dtos/inputs/create-user.input'
import type { UserOutput } from '../dtos/outputs/user.output'

@injectable()
export class CreateUserUseCase extends BaseUseCase<CreateUserInput, UserOutput> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle(input: CreateUserInput, tx: TxClient): Promise<UserOutput> {
    const existing = await this.users.findByEmail(input.email, tx)
    if (existing) throw new AppError('Email already in use', 409)

    const passwordHash = createHash('sha256').update(input.password).digest('hex')
    const user = await this.users.create({ ...input, passwordHash }, tx)

    return {
      id:            user.id,
      email:         user.email,
      role:          user.role,
      accountStatus: user.accountStatus,
      createdAt:     user.createdAt,
    }
  }
}
