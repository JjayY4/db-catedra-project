import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { GetUserParams } from '../dtos/inputs/get-user.input'
import type { UserOutput } from '../dtos/outputs/user.output'

@injectable()
export class GetUserUseCase extends BaseUseCase<GetUserParams, UserOutput> {
  constructor(private readonly users: IUsersRepository) { super() }

  protected async handle({ id }: GetUserParams, tx: TxClient): Promise<UserOutput> {
    const user = await this.users.findById(id, tx)
    if (!user) throw new AppError('User not found', 404)

    return {
      id:            user.id,
      email:         user.email,
      role:          user.role,
      accountStatus: user.accountStatus,
      createdAt:     user.createdAt,
    }
  }
}
