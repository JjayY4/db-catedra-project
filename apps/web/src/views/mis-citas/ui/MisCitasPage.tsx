import { redirect } from 'next/navigation'
import { api } from '@/shared/api/client'
import { requireAuth } from '@/shared/auth/guards.server'
import { AppointmentListWidgetCard } from '@/widgets/appointment-list'
import { Card, CardContent } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface MisCitasPageProps {
  page?: string
}

export async function MisCitasPage({ page: pageParam }: MisCitasPageProps) {
  await requireAuth()

  const page = Number(pageParam ?? '1') || 1
  const { data, error } = await api.appointments.my.get({
    query: { page: String(page), pageSize: '10' },
  })

  if (error) {
    if (error.status === 422) {
      redirect('/complete-profile')
    }
    return (
      <Card className="w-full max-w-3xl">
        <CardContent>
          <Alert variant="destructive" className="text-sm">
            No se pudieron cargar tus citas. Intenta de nuevo más tarde.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <AppointmentListWidgetCard
      upcoming={data?.upcoming ?? []}
      past={data?.past ?? []}
    />
  )
}
