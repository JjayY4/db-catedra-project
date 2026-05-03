import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IAppointmentsRepository } from './domain/interfaces/appointments.repository'
import { DrizzleAppointmentsRepository } from './infrastructure/repositories/drizzle-appointments.repository'
import { BookAppointmentUseCase } from './application/usecases/book-appointment.usecase'
import { BookOnBehalfUseCase } from './application/usecases/book-on-behalf.usecase'
import { GetMyAppointmentsUseCase } from './application/usecases/get-my-appointments.usecase'
import { CancelAppointmentUseCase } from './application/usecases/cancel-appointment.usecase'
import { AcceptAppointmentUseCase } from './application/usecases/accept-appointment.usecase'
import { DeclineAppointmentUseCase } from './application/usecases/decline-appointment.usecase'

export class AppointmentsModule implements AppModule {
  load(container: Container): void {
    container.bind(IAppointmentsRepository).to(DrizzleAppointmentsRepository).inRequestScope()
    container.bind(BookAppointmentUseCase).toSelf().inRequestScope()
    container.bind(BookOnBehalfUseCase).toSelf().inRequestScope()
    container.bind(GetMyAppointmentsUseCase).toSelf().inRequestScope()
    container.bind(CancelAppointmentUseCase).toSelf().inRequestScope()
    container.bind(AcceptAppointmentUseCase).toSelf().inRequestScope()
    container.bind(DeclineAppointmentUseCase).toSelf().inRequestScope()
  }
}
