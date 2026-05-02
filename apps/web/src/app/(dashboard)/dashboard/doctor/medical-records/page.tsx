import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Users, FileText } from 'lucide-react'

export default async function MedicalRecordsListPage() {
  const api = await createServerApi()
  const { data: patients, error } = await api.patients.get({
    query: {
    doctor_id: "b9232877-843c-480e-b2c0-40c51be45d6e", 
    date_from: "2026-05-01",            
    date_to: "2026-05-31",              
  }
  })

  if (error || !patients) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los registros médicos. Revisa la conexión.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pacientes</p>
        <h1 className="text-2xl font-bold">Directorio de Pacientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona un expediente para ver el historial clínico y consultas previas.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.dui} className="hover:border-primary/50 transition-colors flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{patient.firstName} {patient.lastName}</CardTitle>
              </div>
              <CardDescription>DUI: {patient.dui}</CardDescription>
            </CardHeader>
            
            <CardContent>
              {patient.recordId ? (
                <Link
                  href={`/dashboard/doctor/medical-records/${patient.recordId}/history`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  Ver Historial Clínico
                </Link>
              ) : (
                <div className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
                  <FileText className="h-4 w-4" opacity={0.5} />
                  Sin expediente aún
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {patients.length === 0 && (
          <div className="col-span-full">
            <Alert className="text-sm text-muted-foreground">
              No hay pacientes registrados actualmente en el sistema.
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}