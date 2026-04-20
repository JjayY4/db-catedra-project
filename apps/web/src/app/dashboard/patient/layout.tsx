import { requireRole } from '@/shared/auth/guards.server'

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['patient'])
  return <>{children}</>
}
