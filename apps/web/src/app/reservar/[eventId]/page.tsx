import { ReservarCitaPage } from '@/views/reservar-cita'

export const metadata = { title: 'Confirmar cita' }

export default async function ReservarCitaRoute({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center">
      <ReservarCitaPage eventId={eventId} />
    </main>
  )
}
