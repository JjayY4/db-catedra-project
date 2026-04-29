import 'reflect-metadata'
import { ApplicationKernel } from './kernel'
import { UsersModule } from '~/modules/users/users.module'
import { HealthModule } from '~/modules/health/health.module'
// <MODULES_IMPORTS_START>
import { ScheduleEventsModule } from '~/modules/schedule-events/schedule-events.module'
// <MODULES_IMPORTS_END>

const kernel = ApplicationKernel.getInstance([
  new UsersModule(),
  new HealthModule(),
  // <MODULES_REGISTRATION_START>
  new ScheduleEventsModule(),
  // <MODULES_REGISTRATION_END>
])

export const container = kernel.getContainer()
