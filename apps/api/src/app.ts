import 'reflect-metadata'
import { Elysia } from 'elysia'
import { BunAdapter } from 'elysia/adapter/bun'
import { container } from './common/ioc/bootstrap'
import { AppError } from './common/errors/app-error'
import { usersRoutes } from './modules/users/presentation/users.routes'
import { healthRoutes } from './modules/health/presentation/health.routes'
import { betterAuthPlugin } from './auth-plugin'

export const app = new Elysia({ adapter: BunAdapter })
  .decorate('container', container)
  .onError(({ error }) => {
    if (error instanceof AppError) {
      return Response.json({ message: error.message }, { status: error.statusCode })
    }
  })
  .use(healthRoutes)
  .use(betterAuthPlugin)
  .use(usersRoutes)

export type App = typeof app
