import { redirect } from 'next/navigation'
import { api } from '@/shared/api/client'
import { requireAuth } from '@/shared/auth/guards.server'
import { CompleteProfileForm, type InsuranceOption } from '@/features/patient-registration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export async function CompleteProfilePage() {
  const session = await requireAuth()

  if (!session.user.emailVerified) {
    redirect('/verify-email')
  }

  const [{ data: existing }, { data: insurancesData }] = await Promise.all([
    api.patients.me.get(),
    api.patients.insurances.get(),
  ])

  if (existing) {
    redirect('/dashboard')
  }

  const insurances: InsuranceOption[] = insurancesData ?? []

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Completa tu perfil</CardTitle>
        <CardDescription>Necesitamos algunos datos para crear tu expediente.</CardDescription>
      </CardHeader>
      <CardContent>
        <CompleteProfileForm insurances={insurances} />
      </CardContent>
    </Card>
  )
}
