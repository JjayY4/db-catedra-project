import { eq } from 'drizzle-orm'
import { auth } from '@project/auth/src/auth'
import { db } from '@project/db/src/client'
import { Users } from '@project/db/src/schema/iam.schema'
import type { UserRole } from '@project/db/src/schema/enums'
import { FIRST_NAMES, LAST_NAMES, ROLE_SEQUENCE } from './_data'
import { SEED_PASSWORD, slug } from './_helpers'

export type SeededUser = {
  id:    string
  email: string
  name:  string
  role:  UserRole
}

const roleDisplayName = (role: UserRole, first: string, last: string): string => {
  if (role === 'doctor') return `Dr. ${first} ${last}`
  if (role === 'receptionist') return `Recep. ${first} ${last}`
  return `${first} ${last}`
}

export async function seedUsers(): Promise<SeededUser[]> {
  // Better Auth signUpEmail commits its own writes; this runs OUTSIDE the
  // main seed transaction. Sequential to preserve deterministic ordering.
  const seeded: SeededUser[] = []

  for (let i = 0; i < ROLE_SEQUENCE.length; i++) {
    const role  = ROLE_SEQUENCE[i]!
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!
    const last  = LAST_NAMES[(i + 3) % LAST_NAMES.length]!
    const email = `${slug(first)}.${slug(last)}@clinic.com`
    const name  = roleDisplayName(role, first, last)

    await auth.api.signUpEmail({ body: { email, name, password: SEED_PASSWORD } })
    // signUp defaults role='patient'; promote when needed.
    if (role !== 'patient') {
      await db.update(Users).set({ role }).where(eq(Users.email, email))
    }

    const [row] = await db
      .select({ id: Users.id, email: Users.email, name: Users.name, role: Users.role })
      .from(Users)
      .where(eq(Users.email, email))

    if (!row) throw new Error(`Failed to read back seeded user ${email}`)
    seeded.push(row as SeededUser)
  }

  console.log(`  ✓ Users: ${seeded.length} (Better Auth signup, password=${SEED_PASSWORD})`)
  return seeded
}
