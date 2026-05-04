import Link from 'next/link'
import { createServerApi } from '@/shared/api/server'
import { UsersTableWidget } from '@/widgets/users-table'
import { CreateUserDialog } from '@/features/user-management'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { PaginationControls } from '@/views/registrar-paciente/ui/PaginationControls'
import { UserX2Icon, SearchIcon, XIcon } from 'lucide-react'
import { LinkPatientUserDialog } from '@/features/user-management'

const PAGE_SIZE = 20

interface UsuariosPageProps {
  page?:   string
  search?: string
}

export async function UsuariosPage({ page, search = '' }: UsuariosPageProps) {
  const api = await createServerApi()

  const [usersResult, patientsResult] = await Promise.all([
    api.users.list.get({ query: { page: page ?? '1', pageSize: String(PAGE_SIZE), search: search || undefined } as any }),
    api.patients.get({ query: { page: '1', pageSize: '100' } as any }),
  ])

  if (usersResult.error || !usersResult.data) {
    return (
      <div className="space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
          <h1>Usuarios</h1>
        </header>
        <Card>
          <CardContent>
            <Alert variant="destructive" className="text-sm">
              No se pudo cargar la lista de usuarios.
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { items, total, page: currentPage } = usersResult.data
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const unlinked = (patientsResult.data?.items ?? []).filter((p) => p.userId === null)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Doctor</p>
          <h1>Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra cuentas de pacientes, recepcionistas y otros médicos.
          </p>
        </header>
        <CreateUserDialog />
      </div>

      <form method="GET" className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre o email…"
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

      <div className="space-y-3">
        <UsersTableWidget items={items} total={total} />
        {totalPages > 1 && (
          <PaginationControls
            page={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            search={search || undefined}
            label="usuario"
          />
        )}
      </div>

      {unlinked.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserX2Icon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Pacientes sin cuenta</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {unlinked.length}
            </span>
          </div>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">DUI</th>
                  <th className="px-4 py-3">WhatsApp</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {unlinked.map((p) => (
                  <tr key={p.dui} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.dui}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.whatsappPhone}</td>
                    <td className="px-4 py-3 text-right">
                      <LinkPatientUserDialog
                        patientDui={p.dui}
                        patientName={`${p.firstName} ${p.lastName}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
