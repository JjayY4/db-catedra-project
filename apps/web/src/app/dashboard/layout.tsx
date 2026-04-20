import { requireAuth } from '@/shared/auth/guards.server'
import { DashboardNavWidget } from '@/widgets/dashboard-nav'
import { toUser } from '@/entities/user'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth()

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardNavWidget user={toUser(session.user)} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
