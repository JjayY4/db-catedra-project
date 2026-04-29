import { MisCitasPage } from '@/views/mis-citas'

export const metadata = { title: 'Mis citas' }

export default async function MisCitasRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center">
      <MisCitasPage page={page} />
    </main>
  )
}
