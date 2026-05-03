import { DisponibilidadPage } from '@/views/disponibilidad'

export const dynamic = 'force-dynamic'

export default async function DisponibilidadRoute({
  searchParams,
}: {
  searchParams: Promise<{ doctor_id?: string; fecha?: string }>
}) {
  const { doctor_id, fecha } = await searchParams
  const today = new Date().toISOString().split('T')[0]
  return <DisponibilidadPage doctorId={doctor_id} fecha={fecha ?? today} />
}
