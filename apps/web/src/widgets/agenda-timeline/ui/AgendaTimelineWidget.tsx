'use client'

import { useState, useTransition } from 'react'
import type { AgendaItemOutput } from '@project/api/src/modules/doctor-agenda/application/dtos/outputs/agenda-item.output'
import { clientApi } from '@/shared/api/client'
import { SlotCard, DayNav } from '@/shared/ui'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type AgendaStatus = AgendaItemOutput['status']

export type AgendaItem = AgendaItemOutput

interface AgendaTimelineWidgetProps {
  items: AgendaItem[]
  fecha: string
}

const STATUS_MAP: Record<AgendaStatus, 'available' | 'busy' | 'completed' | 'cancelled' | 'pending'> = {
  disponible: 'available',
  reservado:  'busy',
  completado: 'completed',
  cancelado:  'cancelled',
  pendiente:  'pending',
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

function AgendaSlotCard({
  item,
  fecha,
  onBlocked,
  onAccepted,
  onDeclined,
}: {
  item: AgendaItem
  fecha: string
  onBlocked: (slotId: string) => void
  onAccepted: (slotId: string) => void
  onDeclined: (slotId: string) => void
}) {
  const [isBlockPending, startBlockTransition] = useTransition()
  const [isAcceptPending, startAcceptTransition] = useTransition()
  const [isDeclinePending, startDeclineTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isFree = item.status === 'disponible'
  const isPending = item.status === 'pendiente'

  function handleBlock() {
    setError(null)
    startBlockTransition(async () => {
      const { error: err } = await clientApi.doctor['block-slot'].post({
        fecha,
        start: item.startTime,
        end:   item.endTime,
      })
      if (err) {
        const val = err.value
        const msg = val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
          ? val.message
          : 'No se pudo bloquear el horario.'
        setError(msg)
        return
      }
      onBlocked(item.slotId)
    })
  }

  function handleAccept() {
    if (!item.appointmentId) return
    setError(null)
    startAcceptTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (clientApi as any).appointments({ id: item.appointmentId! }).accept.patch({})
      if (err) {
        const val = err.value
        const msg = val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
          ? val.message
          : 'No se pudo aceptar la cita.'
        setError(msg)
        return
      }
      onAccepted(item.slotId)
    })
  }

  function handleDecline() {
    if (!item.appointmentId) return
    setError(null)
    startDeclineTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (clientApi as any).appointments({ id: item.appointmentId! }).decline.patch({})
      if (err) {
        const val = err.value
        const msg = val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
          ? val.message
          : 'No se pudo rechazar la cita.'
        setError(msg)
        return
      }
      onDeclined(item.slotId)
    })
  }

  const label = isFree
    ? 'Cupo disponible'
    : (item.patientName ?? 'Paciente sin nombre')

  const subLabel = isFree
    ? undefined
    : item.bookingReason ?? undefined

  const diagnosisNote =
    !isFree && item.status === 'completado' && item.mainDiagnosis
      ? `Diagnóstico: ${item.mainDiagnosis}`
      : undefined

  return (
    <li key={item.slotId}>
      <SlotCard
        startTime={formatTime(item.startTime)}
        endTime={formatTime(item.endTime)}
        status={STATUS_MAP[item.status]}
        label={label}
        subLabel={diagnosisNote ?? subLabel}
        actions={
          <>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {isFree && (
              <Button
                variant="destructive"
                size="sm"
                disabled={isBlockPending}
                onClick={handleBlock}
              >
                {isBlockPending ? 'Bloqueando…' : 'Bloquear'}
              </Button>
            )}
            {isPending && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isAcceptPending || isDeclinePending}
                  onClick={handleAccept}
                  className="bg-success text-success-foreground hover:bg-success/90"
                >
                  {isAcceptPending ? 'Aceptando…' : 'Aceptar'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isAcceptPending || isDeclinePending}
                  onClick={handleDecline}
                >
                  {isDeclinePending ? 'Rechazando…' : 'Rechazar'}
                </Button>
              </>
            )}
          </>
        }
      />
    </li>
  )
}

export function AgendaTimelineWidget({ items: initialItems, fecha }: AgendaTimelineWidgetProps) {
  const [items, setItems] = useState<AgendaItem[]>(initialItems)

  function handleBlocked(slotId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.slotId === slotId ? { ...item, status: 'cancelado' as AgendaStatus } : item
      )
    )
  }

  function handleAccepted(slotId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.slotId === slotId ? { ...item, status: 'reservado' as AgendaStatus } : item
      )
    )
  }

  function handleDeclined(slotId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.slotId === slotId
          ? { ...item, status: 'disponible' as AgendaStatus, patientName: null, bookingReason: null, appointmentId: null }
          : item
      )
    )
  }

  const subtitle = `${items.length} ${items.length === 1 ? 'bloque' : 'bloques'} en agenda`

  return (
    <div className="space-y-4">
      <DayNav
        fecha={fecha}
        buildHref={(f) => `/dashboard/doctor/agenda?fecha=${f}`}
        subtitle={subtitle}
      />

      {items.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-6 text-center text-sm italic text-muted-foreground">
              No hay bloques programados para este día.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <AgendaSlotCard
              key={item.slotId}
              item={item}
              fecha={fecha}
              onBlocked={handleBlocked}
              onAccepted={handleAccepted}
              onDeclined={handleDeclined}
            />
          ))}
        </ol>
      )}
    </div>
  )
}
