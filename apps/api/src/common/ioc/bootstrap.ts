import 'reflect-metadata'
import { ApplicationKernel } from './kernel'
import { UsersModule } from '~/modules/users/users.module'
import { HealthModule } from '~/modules/health/health.module'
// <MODULES_IMPORTS_START>
import { PatientsModule } from '~/modules/patients/patients.module'
import { ScheduleEventsModule } from '~/modules/schedule-events/schedule-events.module'
import { AppointmentsModule } from '~/modules/appointments/appointments.module'
// <MODULES_IMPORTS_END>

const kernel = ApplicationKernel.getInstance([
  new UsersModule(),
  new HealthModule(),
  // <MODULES_REGISTRATION_START>
  new PatientsModule(),
  new ScheduleEventsModule(),
  new AppointmentsModule(),
  // <MODULES_REGISTRATION_END>
])

export const container = kernel.getContainer()
