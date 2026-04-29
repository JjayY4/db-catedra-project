import { AgendaSecretariaPage } from '@/views/agenda-secretaria'

interface PageProps {
  searchParams: Promise<{ fecha?: string }>
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const { fecha } = await searchParams
  const today = new Date().toISOString().slice(0, 10)
  return <AgendaSecretariaPage fecha={fecha ?? today} />
}
