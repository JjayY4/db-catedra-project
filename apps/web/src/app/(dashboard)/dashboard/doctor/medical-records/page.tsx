import Link from 'next/link'
import { createServerApi } from '@/shared/api/server' // Lo comentamos por hoy
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { Users, FileText } from 'lucide-react'

export default async function MedicalRecordsListPage() {
  const api = await createServerApi()
  
  const { data: patients, error } = await api.users.patients.get()

  if (error || !patients) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los registros médicos.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.userId} className="hover:border-primary/50 transition-colors">
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
              <Link
                href={`/dashboard/doctor/medical-records/6cedf5fd-c05f-43e8-9710-53e390c9b986/history`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Ver Historial Clínico
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}