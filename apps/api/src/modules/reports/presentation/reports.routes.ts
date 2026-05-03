import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetFrequentPatientsUseCase } from '../application/usecases/get-frequent-patients.usecase'
import { GetWeeklyAvailabilityUseCase } from '../application/usecases/get-weekly-availability.usecase'
import { GetPendingConsultationsUseCase } from '../application/usecases/get-pending-consultations.usecase'
import { GetCancelledPerDoctorUseCase } from '../application/usecases/get-cancelled-per-doctor.usecase'

export const reportsRoutes = createRouter({ prefix: '/reports' })
  .use(betterAuthPlugin)
  .get(
    '/frequent-patients',
    ({ container }) => container.get(GetFrequentPatientsUseCase).execute(),
    { roles: ['doctor', 'receptionist'] },
  )
  .get(
    '/weekly-availability',
    ({ container }) => container.get(GetWeeklyAvailabilityUseCase).execute(),
    { roles: ['doctor', 'receptionist'] },
  )
  .get(
    '/pending-consultations',
    ({ container }) => container.get(GetPendingConsultationsUseCase).execute(),
    { roles: ['doctor', 'receptionist'] },
  )
  .get(
    '/cancelled-per-doctor',
    ({ container }) => container.get(GetCancelledPerDoctorUseCase).execute(),
    { roles: ['doctor', 'receptionist'] },
  )
