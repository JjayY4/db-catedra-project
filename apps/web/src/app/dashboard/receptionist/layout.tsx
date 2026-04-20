import { requireRole } from '@/shared/auth/guards.server'

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['receptionist'])
  return <>{children}</>
}
