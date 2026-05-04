import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PatientCitaDetallePageProps {
  appointmentId: string
}

export async function PatientCitaDetallePage({ appointmentId }: PatientCitaDetallePageProps) {
  const api = await createServerApi()
  const { data, error } = await (api['medical-records'] as any)['my-appointment']({ appointmentId }).get()

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/mis-citas" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← Volver a mis citas
        </Link>
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la información de la cita.
        </Alert>
      </div>
    )
  }

  const status = data.availabilityStatus
  const STATUS_LABELS: Record<string, string> = {
    pending:   'Pendiente de aprobación',
    busy:      'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  }
  const statusLabel = STATUS_LABELS[status] ?? status

  return (
    <div className="space-y-6">
      <div>
        <Link href="/mis-citas" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← Volver a mis citas
        </Link>
      </div>

      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Paciente</p>
        <h1 className="text-2xl font-bold">Detalle de cita</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Información de la cita
            <Badge variant={status === 'completed' ? 'success' : status === 'cancelled' ? 'destructive' : 'secondary'}>
              {statusLabel}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {data.patientFirstName} {data.patientLastName}
          </p>
        </CardContent>
      </Card>

      {status === 'available' || status === 'busy' ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">Esta cita aún no ha sido atendida.</p>
          </CardContent>
        </Card>
      ) : status === 'cancelled' ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">Esta cita fue cancelada.</p>
          </CardContent>
        </Card>
      ) : null}

      {data.consultations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consulta médica</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {data.consultations.map((c: any) => (
                <li key={c.id} className="rounded-lg border border-border p-4 space-y-2 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">Diagnóstico</p>
                    <p className="text-muted-foreground">{c.mainDiagnosis}</p>
                  </div>
                  {c.presentedSymptoms && (
                    <div>
                      <p className="font-semibold text-foreground">Síntomas</p>
                      <p className="text-muted-foreground">{c.presentedSymptoms}</p>
                    </div>
                  )}
                  {c.prescribedTreatment && (
                    <div>
                      <p className="font-semibold text-foreground">Tratamiento</p>
                      <p className="text-muted-foreground">{c.prescribedTreatment}</p>
                    </div>
                  )}
                  {c.bloodPressure && (
                    <div>
                      <p className="font-semibold text-foreground">Presión arterial</p>
                      <p className="text-muted-foreground">{c.bloodPressure}</p>
                    </div>
                  )}
                  {c.weightKg && (
                    <div>
                      <p className="font-semibold text-foreground">Peso</p>
                      <p className="text-muted-foreground">{c.weightKg} kg</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
