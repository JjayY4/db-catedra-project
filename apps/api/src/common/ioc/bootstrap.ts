import 'reflect-metadata'
import { ApplicationKernel } from './kernel'
import { UsersModule } from '~/modules/users/users.module'
import { HealthModule } from '~/modules/health/health.module'

const kernel = ApplicationKernel.getInstance([new UsersModule(), new HealthModule()])

export const container = kernel.getContainer()
