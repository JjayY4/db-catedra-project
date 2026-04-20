'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignOutButton } from '@/features/auth'
import type { User } from '@/entities/user'
import { cn } from '@/lib/utils'

const NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard' },
  ],
  doctor: [
    { href: '/dashboard/doctor', label: 'Dashboard' },
  ],
  patient: [
    { href: '/dashboard/patient', label: 'Dashboard' },
  ],
  receptionist: [
    { href: '/dashboard/receptionist', label: 'Dashboard' },
  ],
}

const ROLE_LABELS: Record<string, string> = {
  admin:        'Administrator',
  doctor:       'Doctor',
  patient:      'Patient',
  receptionist: 'Receptionist',
}

interface DashboardNavWidgetProps {
  user: User
}

export function DashboardNavWidget({ user }: DashboardNavWidgetProps) {
  const pathname = usePathname()
  const links = NAV_LINKS[user.role] ?? []

  return (
    <aside className="w-64 h-screen flex flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-5 border-b border-slate-200">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">MediSystem</p>
        <p className="text-sm font-semibold text-slate-900 mt-1">{user.email}</p>
        <span className="inline-block mt-1 text-xs text-slate-500 bg-slate-100 rounded px-2 py-0.5">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-200">
        <SignOutButton />
      </div>
    </aside>
  )
}
