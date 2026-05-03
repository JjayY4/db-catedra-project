import { MedicalHistoryTimeline } from "../../../widgets/medical-history/medical-history-timeline";
import { EditarAntecedentesDialog } from "../../expediente-medico/ui/EditarAntecedentesDialog";
import { createServerApi } from "@/shared/api/server";

interface Props {
  recordId: string;
}

export default async function MedicalRecordHistoryView({ recordId }: Props) {
  const api = await createServerApi()
  const { data, error } = await (api['medical-records'] as any)({ id: recordId }).history.get()

  if (error || !data) {
    return (
      <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-md">
        <p className="font-bold">Error cargando el historial.</p>
      </div>
    );
  }

  const { background, consultations } = data.data;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Historial Clínico</h2>
        <p className="text-sm text-muted-foreground">
          Registro cronológico de consultas y tratamientos.
        </p>
      </div>

      <hr className="border-muted" />

      {/* Medical background */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Antecedentes médicos
          </h3>
          {background && (
            <EditarAntecedentesDialog
              recordId={background.id}
              bloodType={background.bloodType}
              knownAllergies={background.knownAllergies}
              familyHistory={background.familyHistory}
              chronicConditions={background.chronicConditions}
            />
          )}
        </div>
        {!background ? (
          <p className="text-sm text-muted-foreground italic">Antecedentes no disponibles.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">Tipo de sangre</dt>
              <dd>{background.bloodType ?? <span className="italic text-muted-foreground">No registrado</span>}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Expediente abierto</dt>
              <dd>{background.openedAt
                ? new Date(`${background.openedAt}T00:00:00.000Z`).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
                : '—'
              }</dd>
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
      </div>

      <hr className="border-muted" />

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          Consultas registradas
        </h3>
        <MedicalHistoryTimeline consultations={consultations} />
      </div>
    </div>
  );
}
