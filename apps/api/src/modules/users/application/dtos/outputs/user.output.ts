import { t, type Static } from 'elysia'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'

export const UserOutputSchema = t.Object({
  id:            t.String(),
  email:         t.String(),
  role:          t.Enum(UserRole),
  accountStatus: t.Enum(AccountStatus),
  createdAt:     t.Date(),
})

export type UserOutput = Static<typeof UserOutputSchema>
