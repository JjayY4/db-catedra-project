'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AvailableSlotOutput } from '@project/api/src/modules/receptionist-schedule/application/dtos/outputs/available-slot.output'
import { SlotCard } from '@/shared/ui'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReservarCitaForm } from '@/features/booking'

interface CalendarioDisponibilidadWidgetProps {
  slots:           AvailableSlotOutput[]
  isAuthenticated: boolean
}

function formatTime(t: string): string {
  return String(t).slice(0, 5)
}

function isSlotPast(eventDate: string | Date, startTime: string): boolean {
  const now      = new Date()
  const pad      = (n: number) => String(n).padStart(2, '0')
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const dateStr  = eventDate instanceof Date
    ? eventDate.toISOString().slice(0, 10)
    : String(eventDate).slice(0, 10)
  const nowHm    = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return dateStr < todayStr || (dateStr === todayStr && String(startTime).slice(0, 5) < nowHm)
}

export function CalendarioDisponibilidadWidget({
  slots,
  isAuthenticated,
}: CalendarioDisponibilidadWidgetProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<AvailableSlotOutput | null>(null)

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
    <>
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
                  <Button size="sm" onClick={() => setSelected(slot)}>
                    Reservar
                  </Button>
                ) : (
                  <Link
                    href={`/login?redirect=${encodeURIComponent('/disponibilidad')}`}
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

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => { if (!open) setSelected(null) }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar cita</DialogTitle>
            <DialogDescription>
              Revisa los datos y describe el motivo de tu consulta.
            </DialogDescription>
          </DialogHeader>
          {selected !== null && (
            <ReservarCitaForm
              key={selected.id}
              slot={selected}
              isPast={isSlotPast(selected.eventDate, selected.startTime)}
              onSuccess={() => router.refresh()}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
