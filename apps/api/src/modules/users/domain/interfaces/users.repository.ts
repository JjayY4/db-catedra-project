import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IUser } from '../entities/user.entity'

export abstract class IUsersRepository extends IBaseRepository<IUser> {
  abstract findByEmail: RepositoryMethod<[email: string], IUser | null>
  abstract deactivate:  RepositoryMethod<[id: string], void>
}
