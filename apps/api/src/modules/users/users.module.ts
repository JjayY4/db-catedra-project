import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IUsersRepository }       from './domain/interfaces/users.repository'
import { DrizzleUsersRepository } from './infrastructure/repositories/drizzle-users.repository'
import { CreateUserUseCase }      from './application/usecases/create-user.usecase'
import { GetUserUseCase }         from './application/usecases/get-user.usecase'

export class UsersModule implements AppModule {
  load(container: Container): void {
    container.bind(IUsersRepository).to(DrizzleUsersRepository).inRequestScope()
    container.bind(CreateUserUseCase).toSelf().inRequestScope()
    container.bind(GetUserUseCase).toSelf().inRequestScope()
  }
}
