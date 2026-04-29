import 'reflect-metadata'
import { Elysia } from 'elysia'
import { BunAdapter } from 'elysia/adapter/bun'
import { cors } from '@elysiajs/cors'
import { container } from './common/ioc/bootstrap'
import { AppError } from './common/errors/app-error'
import { usersRoutes } from './modules/users/presentation/users.routes'
import { healthRoutes } from './modules/health/presentation/health.routes'
import { betterAuthPlugin } from './auth-plugin'
// <ROUTES_IMPORTS_START>
import { scheduleEventsRoutes } from './modules/schedule-events/presentation/schedule-events.routes'
// <ROUTES_IMPORTS_END>

export const app = new Elysia({ adapter: BunAdapter })
  .use(cors({
    origin: process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3001',
  }))
  .decorate('container', container)
  .onError(({ error }) => {
    if (error instanceof AppError) {
      return Response.json({ message: error.message }, { status: error.statusCode })
    }
  })
  .use(healthRoutes)
  .use(betterAuthPlugin)
  .use(usersRoutes)
  // <ROUTES_REGISTRATION_START>
  .use(scheduleEventsRoutes)
  // <ROUTES_REGISTRATION_END>

export type App = typeof app
