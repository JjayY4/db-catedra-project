import { createServerApi } from '@/shared/api/server'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { NuevaAseguradoraDialog } from './NuevaAseguradoraDialog'
import { EditarAseguradoraDialog } from './EditarAseguradoraDialog'
import { EliminarAseguradoraButton } from './EliminarAseguradoraButton'

const COVERAGE_LABELS: Record<string, string> = {
  basic:         'Básico',
  complete:      'Completo',
  dental:        'Dental',
  vision:        'Visión',
  comprehensive: 'Integral',
}

export async function AseguradorasPage() {
  const api = await createServerApi()
  const { data: insurances, error } = await api.patients.insurances.get({
    fetch: { cache: 'no-store' },
  })

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Administración</p>
          <h1>Aseguradoras</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las aseguradoras disponibles en el sistema.
          </p>
        </div>
        <NuevaAseguradoraDialog />
      </header>

      {error ? (
        <Alert variant="destructive" className="text-sm">
          No se pudo cargar la lista de aseguradoras.
        </Alert>
      ) : !insurances || insurances.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay aseguradoras registradas. Usa el botón &quot;Nueva aseguradora&quot; para agregar una.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Cobertura</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((ins) => (
                <tr key={ins.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{ins.insurerName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {COVERAGE_LABELS[ins.coverageType] ?? ins.coverageType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <EditarAseguradoraDialog insurance={ins} />
                      <EliminarAseguradoraButton id={ins.id} insurerName={ins.insurerName} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
