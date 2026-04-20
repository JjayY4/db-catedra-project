import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IUsersRepository }       from './domain/interfaces/users.repository'
import { DrizzleUsersRepository } from './infrastructure/repositories/drizzle-users.repository'
import { GetMeUseCase }           from './application/usecases/get-me.usecase'

export class UsersModule implements AppModule {
  load(container: Container): void {
    container.bind(IUsersRepository).to(DrizzleUsersRepository).inRequestScope()
    container.bind(GetMeUseCase).toSelf().inRequestScope()
  }
}
