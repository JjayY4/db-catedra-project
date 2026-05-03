import { ReceptionistExpedientePage } from '@/views/expediente-medico'

interface ExpedienteRouteProps {
  params: Promise<{ appointmentId: string }>
}

export default async function ReceptionistExpedienteRoute({ params }: ExpedienteRouteProps) {
  const { appointmentId } = await params
  return <ReceptionistExpedientePage appointmentId={appointmentId} />
}
