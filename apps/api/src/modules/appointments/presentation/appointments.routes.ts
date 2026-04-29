import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { BookAppointmentUseCase } from '../application/usecases/book-appointment.usecase'
import { BookAppointmentInputSchema } from '../application/dtos/inputs/book-appointment.input'
import { AppointmentOutputSchema } from '../application/dtos/outputs/appointment.output'

export const appointmentsRoutes = createRouter({ prefix: '/appointments' })
  .use(betterAuthPlugin)
  .post(
    '/',
    ({ container, user, body }) =>
      container.get(BookAppointmentUseCase).execute({ ...body, userId: user.id }),
    {
      body:     BookAppointmentInputSchema,
      response: AppointmentOutputSchema,
      auth:     true,
    },
  )
