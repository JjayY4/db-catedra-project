import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'

interface ReceptionistExpedientePageProps {
  appointmentId: string
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString('es-ES', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
    timeZone: 'UTC',
  })
}

export async function ReceptionistExpedientePage({ appointmentId }: ReceptionistExpedientePageProps) {
  const api = await createServerApi()
  const { data, error } = await (api['medical-records'] as any)['by-appointment']({ appointmentId }).get()

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1>Expediente</h1>
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la información de la cita.
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/receptionist/agenda"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Volver a agenda
        </Link>
      </div>

      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recepcionista</p>
        <h1>Expediente médico</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Datos del paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Nombre</dt>
              <dd>{data.patientFirstName} {data.patientLastName}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">DUI</dt>
              <dd>{data.patientDui}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Fecha de nacimiento</dt>
              <dd>{formatDate(data.patientBirthDate)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">WhatsApp</dt>
              <dd>{data.whatsappPhone}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {data.consultations.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin consultas previas.</p>
          ) : (
            <ul className="space-y-4">
              {data.consultations.map((c: any) => (
                <li key={c.id} className="rounded-lg border border-border p-4 space-y-1 text-sm">
                  <p className="font-semibold">Diagnóstico: {c.mainDiagnosis}</p>
                  {c.presentedSymptoms && (
                    <p className="text-muted-foreground">Síntomas: {c.presentedSymptoms}</p>
                  )}
                  {c.prescribedTreatment && (
                    <p className="text-muted-foreground">Tratamiento: {c.prescribedTreatment}</p>
                  )}
                  {c.bloodPressure && (
                    <p className="text-muted-foreground">Presión: {c.bloodPressure}</p>
                  )}
                  {c.weightKg && (
                    <p className="text-muted-foreground">Peso: {c.weightKg} kg</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
