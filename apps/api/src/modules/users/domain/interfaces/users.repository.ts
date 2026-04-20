import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IUser } from '../entities/user.entity'
import type { CreateUserInput } from '../../application/dtos/inputs/create-user.input'

export abstract class IUsersRepository extends IBaseRepository<IUser> {
  abstract findByEmail: RepositoryMethod<[email: string], IUser | null>
  abstract create:      RepositoryMethod<[data: CreateUserInput & { passwordHash: string }], IUser>
  abstract deactivate:  RepositoryMethod<[id: string], void>
}
