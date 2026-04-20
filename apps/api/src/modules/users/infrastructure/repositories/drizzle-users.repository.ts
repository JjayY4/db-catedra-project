import { injectable } from 'inversify'
import { eq } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { Users } from '@project/db/src/schema/iam.schema'
import { UserRole } from '@project/enums/src/user-role.enum'
import { AccountStatus } from '@project/enums/src/account-status.enum'
import { IUsersRepository } from '../../domain/interfaces/users.repository'
import type { IUser } from '../../domain/entities/user.entity'

type UserRow = typeof Users.$inferSelect

function toUser(row: UserRow): IUser {
  return {
    id:            row.id,
    email:         row.email,
    role:          row.role as unknown as UserRole,
    accountStatus: row.accountStatus as unknown as AccountStatus,
    createdAt:     row.createdAt,
  }
}

@injectable()
export class DrizzleUsersRepository extends IUsersRepository {
  findById = async (id: string, tx: TxClient): Promise<IUser | null> => {
    const row = await tx.query.Users.findFirst({ where: eq(Users.id, id) })
    return row ? toUser(row) : null
  }

  findByEmail = async (email: string, tx: TxClient): Promise<IUser | null> => {
    const row = await tx.query.Users.findFirst({ where: eq(Users.email, email) })
    return row ? toUser(row) : null
  }

  deactivate = async (id: string, tx: TxClient): Promise<void> => {
    await tx.update(Users).set({ accountStatus: 'inactive' }).where(eq(Users.id, id))
  }
}
