import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { AppError } from '~/common/errors/app-error'
import { GetDailyAgendaReceptionistUseCase } from '../application/usecases/get-daily-agenda-receptionist.usecase'
import { ReceptionistAgendaListOutputSchema } from '../application/dtos/outputs/receptionist-agenda-item.output'

const RECEPTIONIST_ROLES = new Set(['receptionist', 'admin'])

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export const agendaRoutes = createRouter({ prefix: '/agenda' })
  .use(betterAuthPlugin)
  .get(
    '/',
    ({ container, user, query }) => {
      if (!RECEPTIONIST_ROLES.has(user.role as string)) {
        throw new AppError('Forbidden', 403)
      }
      const fecha = query.fecha ?? todayIso()
      return container.get(GetDailyAgendaReceptionistUseCase).execute({ fecha })
    },
    {
      auth:     true,
      query:    t.Object({ fecha: t.Optional(t.String()) }),
      response: ReceptionistAgendaListOutputSchema,
    },
  )
