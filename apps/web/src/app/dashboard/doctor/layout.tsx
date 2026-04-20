import { requireRole } from '@/shared/auth/guards.server'

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['doctor'])
  return <>{children}</>
}
