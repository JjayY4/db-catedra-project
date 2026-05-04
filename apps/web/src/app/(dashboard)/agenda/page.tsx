import { AgendaSecretariaPage } from '@/views/agenda-secretaria'
import { localIsoDate } from '@/lib/date'

interface PageProps {
  searchParams: Promise<{ doctor_id?: string; fecha?: string }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const { doctor_id, fecha } = await searchParams
  const today = localIsoDate()
  return <AgendaSecretariaPage doctorId={doctor_id} fecha={fecha ?? today} />
}
