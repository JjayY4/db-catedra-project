import { RecordExpedientePage } from '@/views/expediente-medico'

interface RecordRouteProps {
  params: Promise<{ recordId: string }>
}

export default async function MedicalRecordRoute({ params }: RecordRouteProps) {
  const { recordId } = await params
  return (
    <main className="p-6 md:p-8">
      <RecordExpedientePage recordId={recordId} />
    </main>
  )
}
