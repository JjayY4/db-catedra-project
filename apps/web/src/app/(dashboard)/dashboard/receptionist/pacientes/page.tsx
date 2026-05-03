import { RegistrarPacientePage } from '@/views/registrar-paciente'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function PacientesRoute({ searchParams }: Props) {
  const { page } = await searchParams
  return <RegistrarPacientePage page={Math.max(1, Number(page) || 1)} />
}
