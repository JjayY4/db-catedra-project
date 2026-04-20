import { requireAuth } from '@/shared/auth/guards.server'
import { AdminDashboardPage } from '@/views/dashboard-admin'
import { toUser } from '@/entities/user'

export default async function AdminRoute() {
  const session = await requireAuth()
  return <AdminDashboardPage user={toUser(session.user)} />
}
