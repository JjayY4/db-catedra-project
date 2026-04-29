import { api } from '@/shared/api/client'
import {
  CalendarioDisponibilidadWidget,
  parseWeekParam,
} from '@/widgets/calendario-disponibilidad'
import type { AvailableSlot } from '@/entities/schedule-event'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

interface DisponibilidadPageProps {
  week?: string
}

export async function DisponibilidadPage({ week }: DisponibilidadPageProps) {
  const range = parseWeekParam(week)

  const { data, error } = await api['schedule-events'].get({
    query: { date_from: range.dateFrom, date_to: range.dateTo },
  })

  if (error) {
    return (
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Disponibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="text-sm">
            No se pudo cargar la disponibilidad. Intenta de nuevo más tarde.
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const slots: AvailableSlot[] = (data ?? []).map((slot) => ({
    id:        slot.id,
    eventDate: slot.eventDate,
    startTime: slot.startTime,
    endTime:   slot.endTime,
  }))

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Horarios disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        <CalendarioDisponibilidadWidget
          slots={slots}
          currentWeek={range.iso}
          days={range.days}
        />
      </CardContent>
    </Card>
  )
}
