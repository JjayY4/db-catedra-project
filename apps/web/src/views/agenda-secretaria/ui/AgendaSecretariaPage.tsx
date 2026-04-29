import { api } from '@/shared/api/client'
import { AgendaTableWidget, DateNav, type AgendaItem } from '@/widgets/agenda-table'
import { BloquearHorariosDialog } from '@/features/block-schedule'

interface AgendaSecretariaPageProps {
  fecha: string
}

export async function AgendaSecretariaPage({ fecha }: AgendaSecretariaPageProps) {
  const { data, error } = await api.agenda.get({ query: { fecha } })

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Agenda</h1>
        <p className="text-sm text-red-600">
          No se pudo cargar la agenda. Intenta nuevamente más tarde.
        </p>
      </div>
    )
  }

  const items: AgendaItem[] = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agenda diaria</h1>
          <p className="text-sm text-slate-500 mt-1">Fecha: {fecha}</p>
        </div>
        <div className="flex items-center gap-3">
          <DateNav fecha={fecha} />
          <BloquearHorariosDialog />
        </div>
      </div>

      <AgendaTableWidget items={items} fecha={fecha} />
    </div>
  )
}
