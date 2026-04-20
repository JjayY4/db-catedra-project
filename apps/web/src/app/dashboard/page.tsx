import { redirect } from 'next/navigation'
import { requireAuth, isUserRole } from '@/shared/auth/guards.server'
import { ROLE_DASHBOARD } from '@/entities/user'

export default async function DashboardPage() {
  const session = await requireAuth()
  const role = session.user.role

  if (isUserRole(role)) redirect(ROLE_DASHBOARD[role])

  return (
    <div className="p-8 text-sm">
      <h1 className="text-lg font-semibold mb-2">Unknown role</h1>
      <p className="text-slate-600 mb-4">
        Your session has no recognized role. Sign out and sign in again.
      </p>
      <pre className="bg-slate-100 p-3 rounded text-xs overflow-auto">
{JSON.stringify(session.user, null, 2)}
      </pre>
    </div>
  )
}
