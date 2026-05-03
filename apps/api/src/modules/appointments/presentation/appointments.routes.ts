import { t } from 'elysia'
import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { BookAppointmentUseCase } from '../application/usecases/book-appointment.usecase'
import { BookOnBehalfUseCase } from '../application/usecases/book-on-behalf.usecase'
import { GetMyAppointmentsUseCase } from '../application/usecases/get-my-appointments.usecase'
import { CancelAppointmentUseCase } from '../application/usecases/cancel-appointment.usecase'
import { AcceptAppointmentUseCase } from '../application/usecases/accept-appointment.usecase'
import { DeclineAppointmentUseCase } from '../application/usecases/decline-appointment.usecase'
import { BookAppointmentInputSchema } from '../application/dtos/inputs/book-appointment.input'
import { BookOnBehalfInputSchema } from '../application/dtos/inputs/book-on-behalf.input'
import { AppointmentOutputSchema } from '../application/dtos/outputs/appointment.output'
import { MyAppointmentsOutputSchema } from '../application/dtos/outputs/my-appointments.output'

export const appointmentsRoutes = createRouter({ prefix: '/appointments' })
  .use(betterAuthPlugin)
  .post(
    '/',
    ({ container, user, body }) =>
      container.get(BookAppointmentUseCase).execute({ ...body, userId: user.id }),
    {
      auth:     true,
      body:     BookAppointmentInputSchema,
      response: AppointmentOutputSchema,
    },
  )
  .get(
    '/my',
    ({ container, user, query }) =>
      container.get(GetMyAppointmentsUseCase).execute({
        userId:   user.id,
        page:     query.page,
        pageSize: query.pageSize,
      }),
    {
      auth:  true,
      query: t.Object({
        page:     t.Optional(t.String()),
        pageSize: t.Optional(t.String()),
      }),
      response: MyAppointmentsOutputSchema,
    },
  )
  .post(
    '/on-behalf',
    ({ container, body }) =>
      container.get(BookOnBehalfUseCase).execute(body),
    {
      roles:    ['receptionist', 'doctor'],
      body:     BookOnBehalfInputSchema,
      response: { 201: AppointmentOutputSchema },
    },
  )
  .patch(
    '/:id/cancel',
    ({ container, user, params }) =>
      container.get(CancelAppointmentUseCase).execute({
        id:                params.id,
        cancelledByUserId: user.id,
      }),
    {
      roles:    ['receptionist', 'doctor'],
      params:   t.Object({ id: t.String({ format: 'uuid' }) }),
      response: t.Object({ success: t.Boolean() }),
    },
  )
  .patch(
    '/:id/accept',
    ({ container, user, params }) =>
      container.get(AcceptAppointmentUseCase).execute({
        appointmentId: params.id,
        doctorId:      user.id,
      }),
    {
      roles:    ['doctor'],
      params:   t.Object({ id: t.String({ format: 'uuid' }) }),
      response: t.Object({ success: t.Boolean() }),
    },
  )
  .patch(
    '/:id/decline',
    ({ container, user, params }) =>
      container.get(DeclineAppointmentUseCase).execute({
        appointmentId: params.id,
        doctorId:      user.id,
      }),
    {
      roles:    ['doctor'],
      params:   t.Object({ id: t.String({ format: 'uuid' }) }),
      response: t.Object({ success: t.Boolean() }),
    },
  )
