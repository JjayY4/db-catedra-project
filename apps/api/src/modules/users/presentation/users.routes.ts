import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { CreateUserUseCase } from '../application/usecases/create-user.usecase'
import { GetUserUseCase }    from '../application/usecases/get-user.usecase'
import { CreateUserInputSchema } from '../application/dtos/inputs/create-user.input'
import { GetUserParamsSchema }   from '../application/dtos/inputs/get-user.input'
import { UserOutputSchema }      from '../application/dtos/outputs/user.output'

export const usersRoutes = createRouter({ prefix: '/users' })
  .use(betterAuthPlugin)
  .post(
    '/',
    ({ container, body }) => container.get(CreateUserUseCase).execute(body),
    { body: CreateUserInputSchema, response: UserOutputSchema, auth: true },
  )
  .get(
    '/:id',
    ({ container, params }) => container.get(GetUserUseCase).execute(params),
    { params: GetUserParamsSchema, response: UserOutputSchema, auth: true },
  )
