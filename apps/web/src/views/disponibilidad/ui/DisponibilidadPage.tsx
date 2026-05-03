import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { getServerSession } from '@/shared/auth/get-session.server'
import { CalendarioDisponibilidadWidget } from '@/widgets/calendario-disponibilidad'
import { DoctorPicker } from '@/features/doctor-picker'
import { DayNav } from '@/shared/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface DisponibilidadPageProps {
  fecha:     string
  doctorId?: string
}

export async function DisponibilidadPage({ fecha, doctorId }: DisponibilidadPageProps) {
  const api = await createServerApi()
  const session = await getServerSession()

  const { data: doctors, error: doctorsError } = await api.users.doctors.get()

  if (doctorsError || !doctors) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="text-sm">
            No se pudo cargar la lista de médicos. Intenta de nuevo más tarde.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const selectedDoctor = doctorId ? doctors.find((d) => d.id === doctorId) : undefined

  const buildHref = (f: string) =>
    doctorId
      ? `/disponibilidad?fecha=${f}&doctor_id=${doctorId}`
      : `/disponibilidad?fecha=${f}`

  if (!selectedDoctor) {
    const { data: allSlots } = await api['schedule-events'].slots.get({ query: { date: fecha } })
    const totalSlots = (allSlots as any[] | null)?.length ?? 0

    return (
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pacientes</p>
          <h1>Selecciona un médico</h1>
          <p className="mt-1 text-muted-foreground">
            Elige al profesional con quien deseas reservar tu cita.
            {totalSlots > 0 && (
              <> <span className="font-medium text-foreground">{totalSlots} {totalSlots === 1 ? 'cupo disponible' : 'cupos disponibles'}</span> para esta fecha.</>
            )}
          </p>
        </header>
        <DoctorPicker
          doctors={doctors}
          baseHref="/disponibilidad"
          extraQuery={{ fecha }}
        />
      </div>
    )
  }

  const { data: slots, error: slotsError } = await api['schedule-events'].get({
    query: {
      doctor_id: selectedDoctor.id,
      date_from: fecha,
      date_to:   fecha,
    },
    fetch: { cache: 'no-store' },
  })

  const slotCount = slots?.length ?? 0

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/disponibilidad?fecha=${fecha}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          ← Médicos
        </Link>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Disponibilidad de {selectedDoctor.name}
        </p>
        <h1>Horarios disponibles</h1>
      </header>

      <DayNav
        fecha={fecha}
        buildHref={buildHref}
        subtitle={`${slotCount} ${slotCount === 1 ? 'cupo disponible' : 'cupos disponibles'}`}
      />

      {slotsError ? (
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la disponibilidad. Intenta de nuevo más tarde.
        </Alert>
      ) : (
        <CalendarioDisponibilidadWidget
          slots={slots ?? []}
          isAuthenticated={!!session}
        />
      )}
    </div>
  )
}
