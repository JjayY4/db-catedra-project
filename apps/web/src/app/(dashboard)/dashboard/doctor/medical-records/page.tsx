import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { PaginationControls } from '@/views/registrar-paciente/ui/PaginationControls'
import { Users, FileText, SearchIcon, XIcon } from 'lucide-react'

const PAGE_SIZE = 12

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function MedicalRecordsListPage({ searchParams }: Props) {
  const { page: pageParam = '1', search = '' } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const api = await createServerApi()
  const { data, error } = await api.patients.get({
    query: { page: String(page), pageSize: String(PAGE_SIZE), search } as any,
  })

  const patients   = data?.items ?? []
  const total      = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pacientes</p>
        <h1 className="text-2xl font-bold">Directorio de Pacientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona un expediente para ver el historial clínico y consultas previas.
        </p>
      </header>

      <form method="GET" className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre o DUI…"
            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input type="hidden" name="page" value="1" />
        </div>
        <button
          type="submit"
          className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          Buscar
        </button>
        {search && (
          <Link
            href="?"
            className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <XIcon className="h-3.5 w-3.5" />
            Limpiar
          </Link>
        )}
      </form>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los registros médicos. Revisa la conexión.
          </AlertDescription>
        </Alert>
      ) : patients.length === 0 ? (
        <Alert className="text-sm text-muted-foreground">
          {search
            ? `No se encontraron pacientes para "${search}".`
            : 'No hay pacientes registrados actualmente en el sistema.'}
        </Alert>
      ) : (
        <>
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
                      href={`/dashboard/doctor/medical-records/${patient.recordId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
                    >
                      Ver historial médico
                    </Link>
                  ) : (
                    <div className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed">
                      <FileText className="h-4 w-4 opacity-50" />
                      Sin expediente aún
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            search={search || undefined}
          />
        </>
      )}
    </div>
  )
}
