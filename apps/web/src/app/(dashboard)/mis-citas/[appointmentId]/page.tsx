import { PatientCitaDetallePage } from '@/views/mis-citas'

interface PageProps {
  params: Promise<{ appointmentId: string }>
}

export default async function Page({ params }: PageProps) {
  const { appointmentId } = await params
  return <PatientCitaDetallePage appointmentId={appointmentId} />
}
