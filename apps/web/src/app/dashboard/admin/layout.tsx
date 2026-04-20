import { requireRole } from '@/shared/auth/guards.server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['admin'])
  return <>{children}</>
}
