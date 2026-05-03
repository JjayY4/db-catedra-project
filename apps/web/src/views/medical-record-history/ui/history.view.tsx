import { MedicalHistoryTimeline } from "../../../widgets/medical-history/medical-history-timeline";
import type { MedicalHistoryResponse } from "../../../entities/medical-records/model/types";
import { cookies } from "next/headers";

interface Props {
  recordId: string;
}

export default async function MedicalRecordHistoryView({ recordId }: Props) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('better-auth.session_token')?.value;
    const res = await fetch(`http://localhost:3000/medical-records/${recordId}/history`, {
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    return (
      <div className="p-4 border border-red-500 bg-red-50 text-red-700 rounded-md">
        <p className="font-bold">Error cargando el historial.</p>
        <p>Status: {res.status}</p>
        <p>Detalle: {errorText}</p>
        <p>URL intentada: http://localhost:3000/medical-records/{recordId}/history</p>
      </div>
    );
  }

  const json: MedicalHistoryResponse = await res.json();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Historial Clínico</h2>
        <p className="text-sm text-muted-foreground">
          Registro cronológico de consultas y tratamientos.
        </p>
      </div>
      
      <hr className="border-muted" />

      <MedicalHistoryTimeline consultations={json.data} />
    </div>
  );
}