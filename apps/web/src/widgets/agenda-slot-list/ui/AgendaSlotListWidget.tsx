'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientApi } from '@/shared/api/client'
import { SlotCard } from '@/shared/ui'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface AgendaItem {
  slotId: string
  startTime: string
  endTime: string
  availabilityStatus: string
  patientName: string | null
  bookingReason: string | null
  whatsappPhone: string | null
  appointmentId: string | null
}

interface PatientOption {
  dui: string
  name: string
}

interface Props {
  items: AgendaItem[]
  doctorId: string
  fecha: string
}

function formatTime(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value
}

export function AgendaSlotListWidget({ items: initialItems, doctorId, fecha }: Props) {
  const [items, setItems] = useState<AgendaItem[]>(initialItems)
  const [loadingSlot, setLoadingSlot] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [patients, setPatients] = useState<PatientOption[]>([])
  const [bookingDialog, setBookingDialog] = useState<{ slotId: string } | null>(null)
  const [selectedPatientDui, setSelectedPatientDui] = useState('')
  const [bookingReason, setBookingReasonState] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(clientApi.patients.get as any)({ query: { page: '1', pageSize: '100' } }).then(({ data }: { data: { items: { dui: string; firstName: string; lastName: string }[] } | null }) => {
      if (data?.items) {
        setPatients(
          data.items.map((p) => ({
            dui: p.dui,
            name: `${p.firstName} ${p.lastName}`,
          }))
        )
      }
    })
  }, [])

  function setSlotStatus(slotId: string, status: string, patch?: Partial<AgendaItem>) {
    setItems((prev) =>
      prev.map((item) =>
        item.slotId === slotId ? { ...item, availabilityStatus: status, ...patch } : item
      )
    )
  }

  function setError(slotId: string, msg: string) {
    setErrors((prev) => ({ ...prev, [slotId]: msg }))
  }

  function clearError(slotId: string) {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
  }

  async function handleBlock(item: AgendaItem) {
    setLoadingSlot(item.slotId)
    clearError(item.slotId)
    const { error } = await clientApi['schedule-events'].block.post({
      doctorId,
      startTime: item.startTime,
      endTime:   item.endTime,
      date:      fecha,
      blockType: 'block',
    })
    setLoadingSlot(null)
    if (error) {
      setError(item.slotId, 'No se pudo bloquear el slot.')
    } else {
      setSlotStatus(item.slotId, 'blocked')
    }
  }

  async function handleUnblock(slotId: string) {
    setLoadingSlot(slotId)
    clearError(slotId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (clientApi as any)['schedule-events']({ id: slotId }).delete()
    setLoadingSlot(null)
    if (error) {
      setError(slotId, 'No se pudo desbloquear el slot.')
    } else {
      setSlotStatus(slotId, 'available')
    }
  }

  async function handleCancel(item: AgendaItem) {
    if (!item.appointmentId) return
    const confirmed = window.confirm(
      `¿Cancelar la cita de ${item.patientName ?? 'este paciente'}?`
    )
    if (!confirmed) return

    setLoadingSlot(item.slotId)
    clearError(item.slotId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (clientApi as any).appointments({ id: item.appointmentId }).cancel.patch()
    setLoadingSlot(null)
    if (error) {
      setError(item.slotId, 'No se pudo cancelar la cita.')
    } else {
      setSlotStatus(item.slotId, 'cancelled')
    }
  }

  async function handleCancelPending(item: AgendaItem) {
    if (!item.appointmentId) return

    setLoadingSlot(item.slotId)
    clearError(item.slotId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (clientApi as any).appointments({ id: item.appointmentId }).cancel.patch()
    setLoadingSlot(null)
    if (error) {
      setError(item.slotId, 'No se pudo cancelar la cita.')
    } else {
      setSlotStatus(item.slotId, 'available', {
        patientName: null,
        bookingReason: null,
        appointmentId: null,
      })
    }
  }

  function openBookingDialog(slotId: string) {
    setBookingDialog({ slotId })
    setSelectedPatientDui('')
    setBookingReasonState('')
    setBookingError('')
  }

  function closeBookingDialog() {
    setBookingDialog(null)
    setBookingError('')
  }

  async function handleConfirmBooking() {
    if (!bookingDialog) return
    if (!selectedPatientDui) {
      setBookingError('Selecciona un paciente.')
      return
    }
    if (!bookingReason.trim() || bookingReason.trim().length > 500) {
      setBookingError('El motivo debe tener entre 1 y 500 caracteres.')
      return
    }

    setBookingLoading(true)
    setBookingError('')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (clientApi.appointments['on-behalf'].post as any)({
      eventId: bookingDialog.slotId,
      patientDui: selectedPatientDui,
      bookingReason: bookingReason.trim(),
    })
    setBookingLoading(false)

    if (error) {
      setBookingError('No se pudo reservar la cita. Intenta nuevamente.')
      return
    }

    const patient = patients.find((p) => p.dui === selectedPatientDui)
    setSlotStatus(bookingDialog.slotId, 'busy', {
      patientName: patient?.name ?? null,
      bookingReason: bookingReason.trim(),
    })
    closeBookingDialog()
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No hay agenda configurada para esta fecha.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => {
          const status = item.availabilityStatus as
            | 'available'
            | 'busy'
            | 'blocked'
            | 'completed'
            | 'cancelled'
            | 'pending'

          const label =
            status === 'busy' || status === 'completed' || status === 'cancelled'
              ? (item.patientName ?? '—')
              : status === 'pending'
                ? (item.patientName ?? '—')
                : status === 'available'
                  ? 'Cupo disponible'
                  : 'Bloqueado'

          const subLabel = item.bookingReason ?? undefined
          const isLoading = loadingSlot === item.slotId
          const slotError = errors[item.slotId]

          let actions: React.ReactNode = null

          if (status === 'available') {
            actions = (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => openBookingDialog(item.slotId)}
                >
                  Reservar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => handleBlock(item)}
                >
                  {isLoading ? 'Bloqueando…' : 'Bloquear'}
                </Button>
              </>
            )
          } else if (status === 'blocked') {
            actions = (
              <Button
                size="sm"
                variant="outline"
                disabled={isLoading}
                onClick={() => handleUnblock(item.slotId)}
              >
                {isLoading ? 'Desbloqueando…' : 'Desbloquear'}
              </Button>
            )
          } else if (status === 'busy') {
            actions = (
              <>
                {item.appointmentId && (
                  <Link
                    href={`/dashboard/receptionist/expediente/${item.appointmentId}`}
                    className={buttonVariants({ size: 'sm', variant: 'outline' })}
                  >
                    Ver expediente
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isLoading}
                  onClick={() => handleCancel(item)}
                >
                  {isLoading ? 'Cancelando…' : 'Cancelar'}
                </Button>
              </>
            )
          } else if (status === 'pending') {
            actions = (
              <Button
                size="sm"
                variant="destructive"
                disabled={isLoading}
                onClick={() => handleCancelPending(item)}
              >
                {isLoading ? 'Cancelando…' : 'Cancelar'}
              </Button>
            )
          } else if (status === 'completed') {
            actions = item.appointmentId ? (
              <Link
                href={`/dashboard/receptionist/expediente/${item.appointmentId}`}
                className={buttonVariants({ size: 'sm', variant: 'outline' })}
              >
                Ver expediente
              </Link>
            ) : null
          }

          return (
            <div key={item.slotId} className="space-y-1">
              <SlotCard
                startTime={formatTime(item.startTime)}
                endTime={formatTime(item.endTime)}
                status={status}
                label={label}
                subLabel={status === 'pending' ? (item.bookingReason ?? 'Pendiente de aprobación') : subLabel}
                actions={actions}
              />
              {slotError && (
                <p className="pl-2 text-xs text-destructive">{slotError}</p>
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={bookingDialog !== null} onOpenChange={(open) => { if (!open) closeBookingDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservar cita para paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Paciente</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={selectedPatientDui}
                onChange={(e) => setSelectedPatientDui(e.target.value)}
              >
                <option value="" disabled>Selecciona un paciente</option>
                {patients.map((p) => (
                  <option key={p.dui} value={p.dui}>
                    {p.name} — {p.dui}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Motivo de consulta</label>
              <Textarea
                value={bookingReason}
                onChange={(e) => setBookingReasonState(e.target.value)}
                placeholder="Describe el motivo de la cita…"
                maxLength={500}
                rows={3}
              />
            </div>
            {bookingError && (
              <p className="text-xs text-destructive">{bookingError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeBookingDialog} disabled={bookingLoading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmBooking} disabled={bookingLoading}>
              {bookingLoading ? 'Reservando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
