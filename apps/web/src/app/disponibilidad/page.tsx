import { DisponibilidadPage } from '@/views/disponibilidad'

export default async function DisponibilidadRoute({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center">
      <DisponibilidadPage week={week} />
    </main>
  )
}
