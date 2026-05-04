import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { NuevoPacienteDialog } from './NuevoPacienteDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { PaginationControls } from './PaginationControls'
import { SearchIcon, XIcon } from 'lucide-react'

const PAGE_SIZE = 10

function formatDate(value: unknown): string {
  const iso = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10)
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

interface Props {
  page:    number
  search?: string
}

export async function RegistrarPacientePage({ page, search = '' }: Props) {
  const api = await createServerApi()
  const { data, error } = await api.patients.get({
    query: { page: String(page), pageSize: String(PAGE_SIZE), search } as any,
    fetch: { cache: 'no-store' },
  })

  const patients = data?.items ?? []
  const total    = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Recepción</p>
          <h1>Pacientes</h1>
          <p className="text-muted-foreground mt-1">
            Consulta y registra pacientes del sistema.
          </p>
        </div>
        <NuevoPacienteDialog />
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
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la lista de pacientes.
        </Alert>
      ) : patients.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search
                ? `No se encontraron pacientes para "${search}".`
                : 'No hay pacientes registrados aún. Usa el botón "Nuevo paciente" para agregar uno.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">DUI</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3">Fecha nac.</th>
                  <th className="px-4 py-3">Aseguradora</th>
                  <th className="px-4 py-3">Cuenta</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.dui}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.dui}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.whatsappPhone}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.birthDate ? formatDate(p.birthDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.insuranceName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.userId ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Sin cuenta
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} search={search || undefined} />
        </div>
      )}
    </div>
  )
}
