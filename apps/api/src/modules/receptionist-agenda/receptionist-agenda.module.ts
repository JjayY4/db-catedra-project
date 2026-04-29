import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IAgendaRepository } from './domain/interfaces/receptionist-agenda.repository'
import { DrizzleAgendaRepository } from './infrastructure/repositories/drizzle-receptionist-agenda.repository'
import { GetDailyAgendaReceptionistUseCase } from './application/usecases/get-daily-agenda-receptionist.usecase'

export class AgendaModule implements AppModule {
  load(container: Container): void {
    container.bind(IAgendaRepository).to(DrizzleAgendaRepository).inRequestScope()
    container.bind(GetDailyAgendaReceptionistUseCase).toSelf().inRequestScope()
  }
}
