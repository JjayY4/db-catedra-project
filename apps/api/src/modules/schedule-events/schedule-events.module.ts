import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IScheduleEventsRepository }       from './domain/interfaces/schedule-events.repository'
import { DrizzleScheduleEventsRepository } from './infrastructure/repositories/drizzle-schedule-events.repository'
import { PreviewWeeklyScheduleUseCase }    from './application/usecases/preview-weekly-schedule.usecase'
import { GenerateWeeklyScheduleUseCase }   from './application/usecases/generate-weekly-schedule.usecase'

export class ScheduleEventsModule implements AppModule {
  load(container: Container): void {
    container.bind(IScheduleEventsRepository).to(DrizzleScheduleEventsRepository).inRequestScope()
    container.bind(PreviewWeeklyScheduleUseCase).toSelf().inRequestScope()
    container.bind(GenerateWeeklyScheduleUseCase).toSelf().inRequestScope()
  }
}
