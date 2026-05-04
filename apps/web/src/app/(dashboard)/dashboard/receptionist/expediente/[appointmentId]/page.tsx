import { UnifiedExpedientePage } from '@/views/expediente-medico'

interface ExpedienteRouteProps {
  params: Promise<{ appointmentId: string }>
}

export default async function ReceptionistExpedienteRoute({ params }: ExpedienteRouteProps) {
  const { appointmentId } = await params
  return (
    <main className="p-6 md:p-8">
      <UnifiedExpedientePage appointmentId={appointmentId} role="receptionist" />
    </main>
  )
}
