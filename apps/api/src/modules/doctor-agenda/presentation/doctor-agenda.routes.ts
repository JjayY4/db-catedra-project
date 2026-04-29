import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetDailyAgendaUseCase } from '../application/usecases/get-daily-agenda.usecase'
import { AgendaListOutputSchema } from '../application/dtos/outputs/agenda-item.output'

export const doctorAgendaRoutes = createRouter({ prefix: '/doctor' })
  .use(betterAuthPlugin)
  .get(
    '/agenda',
    ({ container, query, user }) =>
      container.get(GetDailyAgendaUseCase).execute({
        doctorId: user.id,
        fecha:    query.fecha,
      }),
    {
      roles:    ['doctor'],
      query:    t.Object({
        fecha: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      }),
      response: AgendaListOutputSchema,
    },
  )
