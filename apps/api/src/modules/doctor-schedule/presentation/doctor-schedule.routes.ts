import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { AppError } from '~/common/errors/app-error'
import { GenerateScheduleInputSchema } from '../application/dtos/inputs/generate-schedule.input'
import { PreviewScheduleOutputSchema } from '../application/dtos/outputs/preview-schedule.output'
import { GenerateScheduleOutputSchema } from '../application/dtos/outputs/generate-schedule.output'
import { PreviewWeeklyScheduleUseCase } from '../application/usecases/preview-weekly-schedule.usecase'
import { GenerateWeeklyScheduleUseCase } from '../application/usecases/generate-weekly-schedule.usecase'

function assertDoctor(role: unknown): asserts role is 'doctor' {
  if (role !== 'doctor') throw new AppError('Acceso restringido a personal médico', 403)
}

export const doctorScheduleRoutes = createRouter({ prefix: '/doctor' })
  .use(betterAuthPlugin)
  .post(
    '/schedule/preview',
    ({ container, body, user }) => {
      assertDoctor(user.role)
      return container.get(PreviewWeeklyScheduleUseCase).execute(body)
    },
    {
      auth: true,
      body:     GenerateScheduleInputSchema,
      response: PreviewScheduleOutputSchema,
    },
  )
  .post(
    '/schedule/generate',
    ({ container, body, user }) => {
      assertDoctor(user.role)
      return container.get(GenerateWeeklyScheduleUseCase).execute({ ...body, auditUserId: user.id })
    },
    {
      auth: true,
      body:     GenerateScheduleInputSchema,
      response: GenerateScheduleOutputSchema,
    },
  )
