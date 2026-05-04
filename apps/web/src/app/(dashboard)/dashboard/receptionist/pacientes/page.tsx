import { RegistrarPacientePage } from '@/views/registrar-paciente'

interface Props {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function PacientesRoute({ searchParams }: Props) {
  const { page, search = '' } = await searchParams
  return <RegistrarPacientePage page={Math.max(1, Number(page) || 1)} search={search} />
}
