import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { MedicalHistoryTimeline } from '@/widgets/medical-history/medical-history-timeline'
import { EditarAntecedentesDialog } from './EditarAntecedentesDialog'

interface RecordExpedientePageProps {
  recordId: string
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00.000Z`).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export async function RecordExpedientePage({ recordId }: RecordExpedientePageProps) {
  const api = await createServerApi()

  const [{ data, error }, { data: patientsData }] = await Promise.all([
    (api['medical-records'] as any)({ id: recordId }).history.get({ fetch: { cache: 'no-store' } }),
    api.patients.get({ query: { page: '1', pageSize: '1000' } as any }),
  ])

  if (error || !data) {
    return (
      <div className="space-y-4">
        <h1>Expediente</h1>
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar el expediente médico.
        </Alert>
      </div>
    )
  }

  const { background, consultations } = data.data
  const patient = (patientsData as any)?.items?.find((p: any) => p.recordId === recordId) ?? null

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
        <h1>Expediente médico</h1>
      </header>

      {patient && (
        <Card>
          <CardHeader>
            <CardTitle>Datos del paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Nombre</dt>
                <dd>{patient.firstName} {patient.lastName}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">DUI</dt>
                <dd>{patient.dui}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Fecha de nacimiento</dt>
                <dd>{formatDate(patient.birthDate)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">WhatsApp</dt>
                <dd>{patient.whatsappPhone}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Aseguradora</dt>
                <dd>{patient.insuranceName ?? <span className="text-muted-foreground italic">Sin aseguradora</span>}</dd>
              </div>
              {patient.insuranceCoverage && (
                <div>
                  <dt className="font-medium text-muted-foreground">Cobertura</dt>
                  <dd>{patient.insuranceCoverage}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Antecedentes médicos</CardTitle>
          {background && (
            <EditarAntecedentesDialog
              recordId={background.id}
              bloodType={background.bloodType}
              knownAllergies={background.knownAllergies}
              familyHistory={background.familyHistory}
              chronicConditions={background.chronicConditions}
            />
          )}
        </CardHeader>
        <CardContent>
          {!background ? (
            <p className="text-sm text-muted-foreground italic">El expediente aún no ha sido creado.</p>
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Tipo de sangre</dt>
                <dd>{background.bloodType ?? <span className="italic text-muted-foreground">No registrado</span>}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Expediente abierto</dt>
                <dd>{background.openedAt ? formatDate(background.openedAt) : '—'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Alergias conocidas</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {background.knownAllergies || <span className="italic text-muted-foreground">Ninguna registrada</span>}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Antecedentes familiares</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {background.familyHistory || <span className="italic text-muted-foreground">No registrados</span>}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-medium text-muted-foreground">Condiciones crónicas</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">
                  {background.chronicConditions || <span className="italic text-muted-foreground">Ninguna registrada</span>}
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
    </div>
  )
}
