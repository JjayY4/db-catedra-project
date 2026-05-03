import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { ConsultationForm } from '@/features/complete-consultation'
import { EditarAntecedentesDialog } from './EditarAntecedentesDialog'

interface ExpedientePageProps {
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

export async function ExpedientePage({ appointmentId }: ExpedientePageProps) {
  const api = await createServerApi()
  const { data, error } = await (api['medical-records'] as any)['by-appointment']({ appointmentId }).get()

  const { data: patientHistory } = data?.patientDui
    ? await api['medical-records']['patient-history']({ dui: data.patientDui }).get()
    : { data: null }

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

  const canRegisterConsultation = data.availabilityStatus === 'busy'

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
        <h1>Expediente médico</h1>
      </header>

      {/* Patient info */}
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
          </dl>
        </CardContent>
      </Card>

      {/* Medical background */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Antecedentes médicos</CardTitle>
          {data.recordId && (
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

      {/* Consultation history — sourced from sp_get_patient_history */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {!patientHistory || (patientHistory as any[]).length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Sin consultas previas.</p>
          ) : (
            <ul className="space-y-4">
              {(patientHistory as any[]).map((c, i) => (
                <li key={c.consultationId ?? i} className="rounded-lg border border-border p-4 space-y-1 text-sm">
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
