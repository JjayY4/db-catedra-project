import { createRouter } from '~/common/ioc/elysia-base'
import { betterAuthPlugin } from '~/auth-plugin'
import { GetMeUseCase }      from '../application/usecases/get-me.usecase'
import { UserOutputSchema }  from '../application/dtos/outputs/user.output'

export const usersRoutes = createRouter({ prefix: '/users' })
  .use(betterAuthPlugin)
  .get(
    '/me',
    ({ container, user }) => container.get(GetMeUseCase).execute({ id: user.id }),
    { response: UserOutputSchema, auth: true },
  )
