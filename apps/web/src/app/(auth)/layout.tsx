import { requireGuest } from '@/shared/auth/guards.server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await requireGuest()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">MediSystem</p>
      </div>
      {children}
    </div>
  )
}
