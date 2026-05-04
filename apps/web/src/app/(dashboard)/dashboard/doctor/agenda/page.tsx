import { AgendaDoctorPage } from '@/views/agenda-doctora'
import { localIsoDate } from '@/lib/date'

export default async function AgendaRoute({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>
}) {
  const { fecha } = await searchParams
  const fechaFinal = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : localIsoDate()
  return <AgendaDoctorPage fecha={fechaFinal} />
}
