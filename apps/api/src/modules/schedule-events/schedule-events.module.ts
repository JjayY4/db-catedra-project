import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IScheduleEventsRepository } from './domain/interfaces/schedule-events.repository'
import { DrizzleScheduleEventsRepository } from './infrastructure/repositories/drizzle-schedule-events.repository'
import { GetAvailableSlotsUseCase } from './application/usecases/get-available-slots.usecase'
import { GetScheduleEventUseCase } from './application/usecases/get-schedule-event.usecase'

export class ScheduleEventsModule implements AppModule {
  load(container: Container): void {
    container.bind(IScheduleEventsRepository).to(DrizzleScheduleEventsRepository).inRequestScope()
    container.bind(GetAvailableSlotsUseCase).toSelf().inRequestScope()
    container.bind(GetScheduleEventUseCase).toSelf().inRequestScope()
  }
}
