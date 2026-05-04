import { requireAuth } from '@/shared/auth/guards.server'
import { PatientDashboardPage } from '@/views/dashboard-patient'
import { toUser } from '@/entities/user'

export default async function PatientRoute() {
  const session = await requireAuth()
  const user = toUser(session.user)
  if (process.env.NODE_ENV === 'development') {
    console.log('[PatientRoute debug] session.user keys → Date check', {
      createdAt: session.user.createdAt,
      createdAtIsDate: session.user.createdAt instanceof Date,
    })
  }
  return <PatientDashboardPage user={user} />
}
