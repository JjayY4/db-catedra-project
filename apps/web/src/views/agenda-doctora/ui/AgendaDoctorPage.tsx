import { headers } from 'next/headers'
import { api } from '@/shared/api/client'
import { requireRole } from '@/shared/auth/guards.server'
import { AgendaTimelineWidget, type AgendaItem } from '@/widgets/agenda-timeline'
import { Alert } from '@/components/ui/alert'
import { UserRole } from '@project/enums/src/user-role.enum'

interface AgendaDoctorPageProps {
  fecha: string
}

export async function AgendaDoctorPage({ fecha }: AgendaDoctorPageProps) {
  await requireRole([UserRole.Doctor])

  const cookie = (await headers()).get('cookie') ?? ''
  const { data, error } = await api.doctor.agenda.get({
    query: { fecha },
    fetch: { headers: { cookie } },
  })

  if (error) {
    const message = typeof error.value === 'object' && error.value && 'message' in error.value
      ? String((error.value as { message: unknown }).message)
      : 'No se pudo cargar la agenda.'
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <Alert className="border-red-200 bg-red-50 text-red-800 text-sm p-3 rounded-md">
          {message}
        </Alert>
      </div>
    )
  }

  const items = (data ?? []) as AgendaItem[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-slate-500 mt-1">
          Consulta los bloques de tu jornada y revisa el estado de cada cita.
        </p>
      </div>
      <AgendaTimelineWidget items={items} fecha={fecha} />
    </div>
  )
}
