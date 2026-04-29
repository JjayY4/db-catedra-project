import { requireRole } from '@/shared/auth/guards.server'
import { UserRole } from '@project/enums/src/user-role.enum'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole([UserRole.Admin])
  return <>{children}</>
}
