import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

interface UpcomingItem {
  id:            string
  eventDate:     string
  startTime:     string
  endTime:       string
  bookingReason: string
  status:        string
}

interface PastItem extends UpcomingItem {
  mainDiagnosis:       string | null
  prescribedTreatment: string | null
}

interface AppointmentListWidgetProps {
  upcoming: UpcomingItem[]
  past:     PastItem[]
}

function formatTime(value: string): string {
  return value.slice(0, 5)
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === 'completed'
      ? 'bg-green-100 text-green-800'
      : status === 'cancelled'
        ? 'bg-red-100 text-red-800'
        : 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-block text-xs rounded px-2 py-0.5 ${classes}`}>
      {status}
    </span>
  )
}

export function AppointmentListWidget({ upcoming, past }: AppointmentListWidgetProps) {
  if (upcoming.length === 0 && past.length === 0) {
    return (
      <Card className="p-6 text-center space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Aún no tienes citas</h2>
        <p className="text-sm text-slate-600">
          Reserva tu primera cita en la sección de disponibilidad.
        </p>
        <Link href="/disponibilidad" className={buttonVariants()}>
          Ver disponibilidad
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Próximas citas</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">No tienes citas próximas.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((appt) => (
              <li key={appt.id}>
                <Card className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {appt.eventDate} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{appt.bookingReason}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Citas pasadas</h2>
        {past.length === 0 ? (
          <p className="text-sm text-slate-500">No tienes citas pasadas.</p>
        ) : (
          <ul className="space-y-2">
            {past.map((appt) => (
              <li key={appt.id}>
                <Card className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {appt.eventDate} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{appt.bookingReason}</p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                  {appt.mainDiagnosis && (
                    <div className="text-xs text-slate-600 border-t border-slate-100 pt-2">
                      <p>
                        <span className="font-semibold">Diagnóstico:</span> {appt.mainDiagnosis}
                      </p>
                      {appt.prescribedTreatment && (
                        <p className="mt-1">
                          <span className="font-semibold">Tratamiento:</span>{' '}
                          {appt.prescribedTreatment}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

interface AppointmentListWidgetCardProps extends AppointmentListWidgetProps {
  title?: string
}

export function AppointmentListWidgetCard({ title = 'Mis citas', upcoming, past }: AppointmentListWidgetCardProps) {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentListWidget upcoming={upcoming} past={past} />
      </CardContent>
    </Card>
  )
}
