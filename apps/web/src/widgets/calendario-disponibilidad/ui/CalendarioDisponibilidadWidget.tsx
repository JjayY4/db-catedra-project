import Link from 'next/link'
import type { AvailableSlotOutput } from '@project/api/src/modules/receptionist-schedule/application/dtos/outputs/available-slot.output'
import { SlotCard } from '@/shared/ui'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CalendarioDisponibilidadWidgetProps {
  slots:           AvailableSlotOutput[]
  isAuthenticated: boolean
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

export function CalendarioDisponibilidadWidget({
  slots,
  isAuthenticated,
}: CalendarioDisponibilidadWidgetProps) {
  if (slots.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="py-6 text-center text-sm italic text-muted-foreground">
            No hay cupos disponibles para este día.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ol className="space-y-3">
      {slots.map((slot) => (
        <li key={slot.id}>
          <SlotCard
            startTime={formatTime(slot.startTime)}
            endTime={formatTime(slot.endTime)}
            status="available"
            label="Cupo disponible"
            actions={
              isAuthenticated ? (
                <Link
                  href={`/reservar/${slot.id}`}
                  className={buttonVariants({ size: 'sm' })}
                >
                  Reservar
                </Link>
              ) : (
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/reservar/${slot.id}`)}`}
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  Iniciar sesión
                </Link>
              )
            }
          />
        </li>
      ))}
    </ol>
  )
}
