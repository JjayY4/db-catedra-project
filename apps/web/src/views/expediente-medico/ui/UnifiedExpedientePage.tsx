import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { buttonVariants } from '@/components/ui/button'
import { ConsultationForm } from '@/features/complete-consultation'
import { MedicalHistoryTimeline } from '@/widgets/medical-history/medical-history-timeline'
import { EditarAntecedentesDialog } from './EditarAntecedentesDialog'

interface UnifiedExpedientePageProps {
  appointmentId: string
  role: 'doctor' | 'receptionist'
}

function formatDate(value: string | Date): string {
  const dateOnly = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10)
  return new Date(`${dateOnly}T00:00:00.000Z`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export async function UnifiedExpedientePage({ appointmentId, role }: UnifiedExpedientePageProps) {
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

  const { data: historyData } = data.recordId
    ? await (api['medical-records'] as any)({ id: data.recordId }).history.get({ fetch: { cache: 'no-store' } })
    : { data: null }

  const consultations = historyData?.data?.consultations ?? []
  const isDoctor = role === 'doctor'
  const canRegisterConsultation = isDoctor && data.availabilityStatus === 'busy'

  return (
    <div className="space-y-6">
      {role === 'receptionist' && (
        <Link
          href="/agenda"
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          ← Volver a agenda
        </Link>
      )}

      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {isDoctor ? 'Doctor' : 'Recepcionista'}
        </p>
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
            {isDoctor && (
              <>
                <div>
                  <dt className="font-medium text-muted-foreground">Aseguradora</dt>
                  <dd>{data.insuranceName ?? <span className="text-muted-foreground italic">Sin aseguradora</span>}</dd>
                </div>
                {data.insuranceCoverage && (
                  <div>
                    <dt className="font-medium text-muted-foreground">Cobertura</dt>
                    <dd>{data.insuranceCoverage}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Antecedentes médicos</CardTitle>
          {isDoctor && data.recordId && (
            <EditarAntecedentesDialog
              recordId={data.recordId}
              bloodType={data.bloodType}
              knownAllergies={data.knownAllergies}
              familyHistory={data.familyHistory}
              chronicConditions={data.chronicConditions}
            />
          )}
        </CardHeader>
        <CardContent>
          {!data.recordId ? (
            <p className="text-sm text-muted-foreground italic">El expediente aún no ha sido creado.</p>
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Tipo de sangre</dt>
                <dd>{data.bloodType ?? <span className="italic text-muted-foreground">No registrado</span>}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Expediente abierto</dt>
                <dd>{data.openedAt ? formatDate(data.openedAt) : '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Alergias conocidas</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {data.knownAllergies || <span className="italic text-muted-foreground">Ninguna registrada</span>}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Antecedentes familiares</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {data.familyHistory || <span className="italic text-muted-foreground">No registrados</span>}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Condiciones crónicas</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {data.chronicConditions || <span className="italic text-muted-foreground">Ninguna registrada</span>}
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicalHistoryTimeline consultations={consultations} />
        </CardContent>
      </Card>

      {canRegisterConsultation && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar consulta</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsultationForm appointmentId={appointmentId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
