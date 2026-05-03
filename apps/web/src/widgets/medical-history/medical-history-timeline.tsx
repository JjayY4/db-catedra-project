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
  <div className="relative ml-4 border-l-2 border-gray-300 dark:border-gray-700 pl-6 space-y-6 py-4">
    {consultations.map((consultation) => (
      <div key={consultation.id} className="relative">
        
        <span className="absolute -left-[30px] top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 shadow-sm">
          <Stethoscope className="h-4 w-4 text-gray-500" />
        </span>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {consultation.mainDiagnosis}
            </h3>
            <span className="text-xs text-gray-400">
              ID: {consultation.id.slice(0, 8)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {consultation.presentedSymptoms}
          </p>
          <div className="mt-3 rounded-md bg-gray-100 dark:bg-gray-800 p-3 text-sm border border-gray-200 dark:border-gray-700">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              Tratamiento:
            </span>{" "}
            {consultation.prescribedTreatment}
          </div>
          {(consultation.bloodPressure || consultation.weightKg) && (
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              {consultation.bloodPressure && (
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  PA: {consultation.bloodPressure}
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