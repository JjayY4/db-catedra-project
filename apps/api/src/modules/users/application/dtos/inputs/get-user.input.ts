import { t, type Static } from 'elysia'

export const GetUserParamsSchema = t.Object({
  id: t.String({ minLength: 1 }),
})

export type GetUserParams = Static<typeof GetUserParamsSchema>
