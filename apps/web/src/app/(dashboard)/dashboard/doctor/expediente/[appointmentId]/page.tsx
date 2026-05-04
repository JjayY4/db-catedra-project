import { UnifiedExpedientePage } from '@/views/expediente-medico'

interface ExpedienteRouteProps {
  params: Promise<{ appointmentId: string }>
}

export default async function ExpedienteRoute({ params }: ExpedienteRouteProps) {
  const { appointmentId } = await params
  return <UnifiedExpedientePage appointmentId={appointmentId} role="doctor" />
}
