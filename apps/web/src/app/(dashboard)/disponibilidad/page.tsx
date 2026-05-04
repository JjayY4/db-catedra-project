import { DisponibilidadPage } from '@/views/disponibilidad'
import { localIsoDate } from '@/lib/date'

export const dynamic = 'force-dynamic'

export default async function DisponibilidadRoute({
  searchParams,
}: {
  searchParams: Promise<{ doctor_id?: string; fecha?: string }>
}) {
  const { doctor_id, fecha } = await searchParams
  const today = localIsoDate()
  return <DisponibilidadPage doctorId={doctor_id} fecha={fecha ?? today} />
}
