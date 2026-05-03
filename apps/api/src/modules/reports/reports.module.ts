import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { GetFrequentPatientsUseCase } from './application/usecases/get-frequent-patients.usecase'
import { GetWeeklyAvailabilityUseCase } from './application/usecases/get-weekly-availability.usecase'
import { GetPendingConsultationsUseCase } from './application/usecases/get-pending-consultations.usecase'
import { GetCancelledPerDoctorUseCase } from './application/usecases/get-cancelled-per-doctor.usecase'

export class ReportsModule implements AppModule {
  load(container: Container): void {
    container.bind(GetFrequentPatientsUseCase).toSelf().inRequestScope()
    container.bind(GetWeeklyAvailabilityUseCase).toSelf().inRequestScope()
    container.bind(GetPendingConsultationsUseCase).toSelf().inRequestScope()
    container.bind(GetCancelledPerDoctorUseCase).toSelf().inRequestScope()
  }
}
