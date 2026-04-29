import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { GetAvailableSlotsUseCase } from '../application/usecases/get-available-slots.usecase'
import { GetScheduleEventUseCase } from '../application/usecases/get-schedule-event.usecase'
import { AvailableSlotOutputSchema } from '../application/dtos/outputs/available-slot.output'

export const scheduleEventsRoutes = createRouter({ prefix: '/schedule-events' })
  .get(
    '/',
    ({ container, query }) =>
      container.get(GetAvailableSlotsUseCase).execute({
        dateFrom: query.date_from,
        dateTo:   query.date_to,
      }),
    {
      query: t.Object({
        date_from: t.String(),
        date_to:   t.String(),
      }),
      response: t.Array(AvailableSlotOutputSchema),
    },
  )
  .get(
    '/:id',
    ({ container, params }) => container.get(GetScheduleEventUseCase).execute({ id: params.id }),
    {
      params:   t.Object({ id: t.String() }),
      response: AvailableSlotOutputSchema,
    },
  )
