import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { AgendaSlotListWidget } from '@/widgets/agenda-slot-list'
import { DoctorPicker } from '@/features/doctor-picker'
import { DayNav } from '@/shared/ui'
import { Alert } from '@/components/ui/alert'

interface AgendaSecretariaPageProps {
  doctorId?: string
  fecha:     string
}

export async function AgendaSecretariaPage({ doctorId, fecha }: AgendaSecretariaPageProps) {
  const api = await createServerApi()
  const { data: doctors, error: doctorsError } = await api.users.doctors.get()

  if (doctorsError || !doctors) {
    return (
      <div className="space-y-4">
        <h1>Agenda</h1>
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la lista de médicos.
        </Alert>
      </div>
    )
  }

  const selectedDoctor = doctorId ? doctors.find((d) => d.id === doctorId) : undefined

  if (!selectedDoctor) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reception</p>
          <h1>Selecciona un médico</h1>
          <p className="text-muted-foreground mt-1">
            Elige al profesional para administrar su agenda.
          </p>
        </header>
        <DoctorPicker
          doctors={doctors}
          baseHref="/agenda"
          extraQuery={{ fecha }}
        />
      </div>
    )
  }

  const { data, error } = await api.agenda.daily.get({
    query: { doctor_id: selectedDoctor.id, fecha },
  })

  const items = Array.isArray(data) ? data : []

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/agenda?fecha=${fecha}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          ← Médicos
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Reception</p>
        <h1>Agenda de {selectedDoctor.name}</h1>
      </div>

      <DayNav
        fecha={fecha}
        buildHref={(f) => `/agenda?doctor_id=${selectedDoctor.id}&fecha=${f}`}
        subtitle={`${items.length} bloques en agenda`}
      />

      {error ? (
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la agenda. Intenta nuevamente más tarde.
        </Alert>
      ) : (
        <AgendaSlotListWidget
          items={items}
          doctorId={selectedDoctor.id}
          fecha={fecha}
        />
      )}
    </div>
  )
}
