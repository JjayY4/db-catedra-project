import type { ClinicalConsultation } from "../../entities/medical-records/model/types";
import { Activity, Stethoscope, FileText } from "lucide-react";

interface Props {
  consultations: ClinicalConsultation[];
}

export function MedicalHistoryTimeline({ consultations }: Props) {
  if (!consultations || consultations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-20" />
        <p>No hay consultas registradas en este expediente.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-muted ml-3 space-y-8 py-4">
      {consultations.map((consultation) => (
        <div key={consultation.id} className="relative pl-8">
          <span className="absolute -left-3.5 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-background border border-muted">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </span>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium leading-none">
                {consultation.mainDiagnosis}
              </h3>
              <span className="text-xs text-muted-foreground">
                ID Consulta: {consultation.id.slice(0, 8)}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {consultation.presentedSymptoms}
            </p>

            <div className="mt-2 rounded-md bg-muted/50 p-3 text-sm">
              <span className="font-medium text-foreground">Tratamiento:</span>{" "}
              {consultation.prescribedTreatment}
            </div>

            {(consultation.bloodPressure || consultation.weightKg) && (
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {consultation.bloodPressure && (
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" /> PA: {consultation.bloodPressure}
                  </span>
                )}
                {consultation.weightKg && (
                  <span>Peso: {consultation.weightKg} kg</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}