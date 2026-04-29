import { ConfigurarHorariosForm } from '@/features/schedule-config'

export function ConfigurarHorariosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurar Horarios</h1>
        <p className="text-slate-500 mt-1">
          Define los bloques de disponibilidad para que los pacientes puedan reservar.
        </p>
      </div>
      <ConfigurarHorariosForm />
    </div>
  )
}
