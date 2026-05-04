import { UsuariosPage } from '@/views/usuarios'

export const metadata = { title: 'Usuarios' }

export default async function UsuariosRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const { page, search = '' } = await searchParams
  return <UsuariosPage page={page} search={search} />
}
