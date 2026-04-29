import 'reflect-metadata'
import { ApplicationKernel } from './kernel'
import { UsersModule } from '~/modules/users/users.module'
import { HealthModule } from '~/modules/health/health.module'
// <MODULES_IMPORTS_START>
import { DoctorScheduleModule } from '~/modules/doctor-schedule/doctor-schedule.module'
import { DoctorAgendaModule } from '~/modules/doctor-agenda/doctor-agenda.module'
// <MODULES_IMPORTS_END>

const kernel = ApplicationKernel.getInstance([
  new UsersModule(),
  new HealthModule(),
  // <MODULES_REGISTRATION_START>
  new DoctorScheduleModule(),
  new DoctorAgendaModule(),
  // <MODULES_REGISTRATION_END>
])

export const container = kernel.getContainer()
