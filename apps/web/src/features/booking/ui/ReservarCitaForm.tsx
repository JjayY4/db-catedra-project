'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2Icon, CalendarIcon, ClockIcon, XCircleIcon } from 'lucide-react'
import { clientApi } from '@/shared/api/client'
import {
  bookAppointmentSchema,
  type BookAppointmentValues,
} from '@/entities/medical-appointment'
import type { AvailableSlotOutput } from '@project/api/src/modules/receptionist-schedule/application/dtos/outputs/available-slot.output'
import { Button, buttonVariants } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ReservarCitaFormProps {
  slot:       AvailableSlotOutput
  isPast?:    boolean
  onSuccess?: () => void
}

interface ConfirmedAppointment {
  id:            string
  bookingReason: string
}

function formatTime(value: string): string {
  return String(value).slice(0, 5)
}

function formatDate(value: string | Date): string {
  const dateOnly = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10)
  return new Date(`${dateOnly}T00:00:00.000Z`).toLocaleDateString('es', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

export function ReservarCitaForm({ slot, isPast = false, onSuccess }: ReservarCitaFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [slotTaken, setSlotTaken] = useState(false)
  const [confirmed, setConfirmed] = useState<ConfirmedAppointment | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookAppointmentValues>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: { eventId: slot.id, bookingReason: '' },
  })

  const reasonValue = watch('bookingReason') ?? ''

  function onSubmit(values: BookAppointmentValues) {
    setServerError(null)
    setSlotTaken(false)
    startTransition(async () => {
      const { data, error } = await clientApi.appointments.post({
        eventId:       values.eventId,
        bookingReason: values.bookingReason,
      })
      if (error) {
        const status: number = error.status
        if (status === 422) {
          router.push('/complete-profile')
          return
        }
        if (status === 409) {
          setSlotTaken(true)
          return
        }
        const value = error.value
        const message =
          value && typeof value === 'object' && 'message' in value && typeof value.message === 'string'
            ? value.message
            : 'No se pudo confirmar tu cita. Intenta de nuevo.'
        setServerError(message)
        return
      }
      if (data) {
        setConfirmed({ id: data.id, bookingReason: data.bookingReason })
        onSuccess?.()
      }
    })
  }

  if (isPast) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-muted bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Horario seleccionado
          </p>
          <p className="mt-1 text-base font-semibold text-muted-foreground line-through">
            {formatDate(slot.eventDate)}
          </p>
          <p className="text-sm text-muted-foreground/60">
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </p>
        </div>
        <Alert variant="destructive" className="text-sm">
          Este cupo ya pasó y no está disponible para reservar.
        </Alert>
        <Link href="/disponibilidad" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
          Ver disponibilidad
        </Link>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-success/10 border border-success/20 p-4">
          <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Solicitud enviada</p>
            <p className="text-sm text-muted-foreground">
              El médico la confirmará en breve.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Motivo: </span>
          {confirmed.bookingReason}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/patient" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1')}>
            Volver al inicio
          </Link>
          <Link href="/mis-citas" className={cn(buttonVariants(), 'flex-1')}>
            Ver mis citas
          </Link>
        </div>
      </div>
    )
  }

  if (slotTaken) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">Cupo no disponible</p>
            <p className="text-sm text-muted-foreground">
              Ese cupo ya no está disponible. Elige otro horario.
            </p>
          </div>
        </div>
        <Link href="/disponibilidad" className={cn(buttonVariants(), 'w-full')}>
          Ver disponibilidad
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Horario seleccionado
        </p>
        <div className="mt-2 space-y-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            {formatDate(slot.eventDate)}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon className="h-3.5 w-3.5" />
            {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
          </p>
        </div>
      </div>

      {serverError && (
        <Alert variant="destructive" className="text-sm">
          {serverError}
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="bookingReason">Motivo de consulta</Label>
        <Textarea
          id="bookingReason"
          rows={4}
          placeholder="Describe brevemente el motivo de tu consulta"
          {...register('bookingReason')}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{errors.bookingReason?.message ?? ' '}</span>
          <span>{reasonValue.length}/500</span>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Confirmando…' : 'Confirmar cita'}
      </Button>
    </form>
  )
}
