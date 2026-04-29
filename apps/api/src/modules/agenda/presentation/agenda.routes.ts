import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { AppError } from '~/common/errors/app-error'
import { GetDailyAgendaUseCase } from '../application/usecases/get-daily-agenda.usecase'
import { AgendaListOutputSchema } from '../application/dtos/outputs/agenda-item.output'

function assertDoctor(role: unknown): asserts role is 'doctor' {
  if (role !== 'doctor') throw new AppError('Acceso restringido a personal médico', 403)
}

export const agendaRoutes = createRouter({ prefix: '/agenda' })
  .use(betterAuthPlugin)
  .get(
    '/',
    ({ container, query, user }) => {
      assertDoctor(user.role)
      return container.get(GetDailyAgendaUseCase).execute({ fecha: query.fecha })
    },
    {
      auth: true,
      query: t.Object({
        fecha: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      }),
      response: AgendaListOutputSchema,
    },
  )
