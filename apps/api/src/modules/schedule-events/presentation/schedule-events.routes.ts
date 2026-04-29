import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { AppError } from '~/common/errors/app-error'
import { CreateBlockUseCase } from '../application/usecases/create-block.usecase'
import { DeleteBlockUseCase } from '../application/usecases/delete-block.usecase'
import { CreateBlockInputSchema } from '../application/dtos/inputs/create-block.input'
import { ScheduleEventListOutputSchema } from '../application/dtos/outputs/schedule-event.output'

const RECEPTIONIST_ROLES = new Set(['receptionist', 'admin'])

function ensureRole(role: unknown): void {
  if (!RECEPTIONIST_ROLES.has(role as string)) {
    throw new AppError('Forbidden', 403)
  }
}

export const scheduleEventsRoutes = createRouter({ prefix: '/schedule-events' })
  .use(betterAuthPlugin)
  .post(
    '/block',
    async ({ container, body, user }) => {
      ensureRole(user.role)
      const result = await container.get(CreateBlockUseCase).execute({
        ...body,
        auditUserId: user.id,
      })
      return result.map((event) => ({
        id:                 event.id,
        eventDate:          event.eventDate,
        startTime:          event.startTime,
        endTime:            event.endTime,
        eventType:          event.eventType,
        availabilityStatus: event.availabilityStatus,
      }))
    },
    {
      auth:     true,
      body:     CreateBlockInputSchema,
      response: ScheduleEventListOutputSchema,
    },
  )
  .delete(
    '/:id',
    async ({ container, params, user }) => {
      ensureRole(user.role)
      await container.get(DeleteBlockUseCase).execute({ id: params.id })
      return { success: true }
    },
    {
      auth:     true,
      params:   t.Object({ id: t.String() }),
      response: t.Object({ success: t.Boolean() }),
    },
  )
