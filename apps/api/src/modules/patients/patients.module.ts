import type { Container } from 'inversify'
import type { AppModule } from '~/common/ioc/kernel'
import { IPatientsRepository } from './domain/interfaces/patients.repository'
import { DrizzlePatientsRepository } from './infrastructure/repositories/drizzle-patients.repository'
import { CompleteProfileUseCase } from './application/usecases/complete-profile.usecase'
import { GetMyPatientUseCase } from './application/usecases/get-my-patient.usecase'
import { ListInsurancesUseCase } from './application/usecases/list-insurances.usecase'
import { ListPatientsUseCase } from './application/usecases/list-patients.usecase'
import { RegisterPatientUseCase } from './application/usecases/register-patient.usecase'
import { CreateInsuranceUseCase } from './application/usecases/create-insurance.usecase'
import { UpdateInsuranceUseCase } from './application/usecases/update-insurance.usecase'
import { DeleteInsuranceUseCase } from './application/usecases/delete-insurance.usecase'

export class PatientsModule implements AppModule {
  load(container: Container): void {
    container.bind(IPatientsRepository).to(DrizzlePatientsRepository).inRequestScope()
    container.bind(CompleteProfileUseCase).toSelf().inRequestScope()
    container.bind(GetMyPatientUseCase).toSelf().inRequestScope()
    container.bind(ListInsurancesUseCase).toSelf().inRequestScope()
    container.bind(ListPatientsUseCase).toSelf().inRequestScope()
    container.bind(RegisterPatientUseCase).toSelf().inRequestScope()
    container.bind(CreateInsuranceUseCase).toSelf().inRequestScope()
    container.bind(UpdateInsuranceUseCase).toSelf().inRequestScope()
    container.bind(DeleteInsuranceUseCase).toSelf().inRequestScope()
  }
}
