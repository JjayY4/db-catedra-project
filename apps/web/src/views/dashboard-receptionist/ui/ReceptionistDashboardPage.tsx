import Link from 'next/link'
import { CalendarDays, ClipboardList, MessageCircle, Users, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { createServerApi } from '@/shared/api/server'
import { localIsoDate } from '@/lib/date'
import type { User } from '@/entities/user'

interface ReceptionistDashboardPageProps {
  user: User
}

export async function ReceptionistDashboardPage({ user }: ReceptionistDashboardPageProps) {
  const today = localIsoDate()

  let totalCitas = 0
  let reservadas = 0
  let disponibles = 0
  let frecuentes = 0
  let canceladas = 0

  try {
    const api = await createServerApi()

    const [
      agendaResult,
      availabilityResult,
      frecuentesResult,
      canceladasResult,
    ] = await Promise.all([
      api.users.doctors.get().then(async ({ data: doctors }) => {
        const first = doctors?.[0]
        if (!first) return null
        return api.agenda.daily.get({ query: { doctor_id: first.id, fecha: today } })
      }),
      api['schedule-events']['check-availability'].get({ query: { date: today } }),
      api.reports['frequent-patients'].get(),
      api.reports['cancelled-per-doctor'].get(),
    ])

    if (agendaResult?.data) {
      totalCitas = agendaResult.data.length
      reservadas = agendaResult.data.filter((i) => i.availabilityStatus === 'busy').length
    }
    disponibles = (availabilityResult.data as any[] | null)?.length ?? 0
    frecuentes  = (frecuentesResult.data as any[] | null)?.length ?? 0
    canceladas  = ((canceladasResult.data as any[] | null) ?? []).reduce(
      (sum: number, r: any) => sum + (r.cancelledCount ?? 0), 0,
    )
  } catch {
    // show 0 if API fails
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recepción</p>
        <h1>Reception Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays}  title="Citas hoy"           value={String(totalCitas)} tone="primary"   />
        <StatCard icon={ClipboardList} title="Reservadas hoy"      value={String(reservadas)} tone="warning"   />
        <StatCard icon={MessageCircle} title="Disponibles hoy"     value={String(disponibles)} tone="secondary" />
        <StatCard icon={Users}         title="Pacientes frecuentes" value={String(frecuentes)} tone="primary"   />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={XCircle} title="Canceladas este mes" value={String(canceladas)} tone="warning" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/agenda" className={buttonVariants()}>
          Ver agenda de hoy
        </Link>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  title,
  value,
  tone,
}: {
  icon: typeof MessageCircle
  title: string
  value: string
  tone: 'primary' | 'secondary' | 'warning'
}) {
  const toneClass = {
    primary:   'bg-primary/10 text-primary',
    secondary: 'bg-secondary/15 text-secondary',
    warning:   'bg-warning/20 text-warning-foreground',
  }[tone]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-bold mt-1">{value}</CardTitle>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent />
    </Card>
  )
}
