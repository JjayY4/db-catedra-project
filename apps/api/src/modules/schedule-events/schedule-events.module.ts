import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IScheduleEventsRepository } from './domain/interfaces/schedule-events.repository'
import { DrizzleScheduleEventsRepository } from './infrastructure/repositories/drizzle-schedule-events.repository'
import { CreateBlockUseCase } from './application/usecases/create-block.usecase'
import { DeleteBlockUseCase } from './application/usecases/delete-block.usecase'

export class ScheduleEventsModule implements AppModule {
  load(container: Container): void {
    container.bind(IScheduleEventsRepository).to(DrizzleScheduleEventsRepository).inRequestScope()
    container.bind(CreateBlockUseCase).toSelf().inRequestScope()
    container.bind(DeleteBlockUseCase).toSelf().inRequestScope()
  }
}
