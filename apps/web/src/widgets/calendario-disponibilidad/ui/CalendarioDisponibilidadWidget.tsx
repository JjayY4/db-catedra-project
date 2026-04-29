'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from '@/shared/auth/client'
import type { AvailableSlot } from '@/entities/schedule-event'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { dayLabel, formatDateLabel, formatTime, shiftWeek } from '../lib/week'

interface CalendarioDisponibilidadWidgetProps {
  slots:       AvailableSlot[]
  currentWeek: string
  days:        string[]
}

export function CalendarioDisponibilidadWidget({
  slots,
  currentWeek,
  days,
}: CalendarioDisponibilidadWidgetProps) {
  const router = useRouter()
  const session = useSession()
  const [showLoginPrompt, setShowLoginPrompt] = useState<AvailableSlot | null>(null)

  const slotsByDay = new Map<string, AvailableSlot[]>()
  for (const slot of slots) {
    const list = slotsByDay.get(slot.eventDate) ?? []
    list.push(slot)
    slotsByDay.set(slot.eventDate, list)
  }

  const previousWeek = shiftWeek(currentWeek, -1)
  const nextWeek = shiftWeek(currentWeek, 1)

  function handleSlotClick(slot: AvailableSlot) {
    if (session.data) {
      router.push(`/reservar/${slot.id}`)
      return
    }
    setShowLoginPrompt(slot)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/disponibilidad?week=${previousWeek}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          ← Semana anterior
        </Link>
        <p className="text-sm font-medium text-slate-700">{currentWeek}</p>
        <Link
          href={`/disponibilidad?week=${nextWeek}`}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Semana siguiente →
        </Link>
      </div>

      {slots.length === 0 ? (
        <Alert className="text-sm">No hay horarios disponibles esta semana.</Alert>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {days.map((isoDate, index) => {
            const daySlots = slotsByDay.get(isoDate) ?? []
            return (
              <div key={isoDate} className="flex flex-col gap-1">
                <div className="text-center text-xs font-semibold text-slate-600">
                  {dayLabel(index)} {formatDateLabel(isoDate)}
                </div>
                {daySlots.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-3">—</div>
                ) : (
                  daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleSlotClick(slot)}
                      className="rounded-md border border-slate-200 bg-white p-2 text-left text-xs hover:bg-slate-50 transition-colors"
                    >
                      <span className="block font-medium text-slate-900">
                        {formatTime(slot.startTime)}
                      </span>
                      <span className="block text-slate-500">{formatTime(slot.endTime)}</span>
                    </button>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      {showLoginPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <Card className="w-full max-w-sm p-4 space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Inicia sesión para reservar</h2>
            <p className="text-sm text-slate-600">
              Necesitas tener una cuenta para confirmar tu cita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowLoginPrompt(null)}>
                Cancelar
              </Button>
              <Link
                href={`/login?redirect=${encodeURIComponent(`/reservar/${showLoginPrompt.id}`)}`}
                className={buttonVariants({ size: 'sm' })}
              >
                Iniciar sesión
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
