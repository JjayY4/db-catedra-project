import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AgendaStatus = 'disponible' | 'reservado' | 'completado' | 'cancelado'

export interface AgendaItem {
  slotId:        string
  startTime:     string
  endTime:       string
  patientId:     string | null
  patientName:   string | null
  bookingReason: string | null
  status:        AgendaStatus
  mainDiagnosis: string | null
}

interface AgendaTimelineWidgetProps {
  items: AgendaItem[]
  fecha: string
}

const STATUS_LABEL: Record<AgendaStatus, string> = {
  disponible: 'Disponible',
  reservado:  'Reservado',
  completado: 'Completado',
  cancelado:  'Cancelado',
}

const STATUS_STYLES: Record<AgendaStatus, { card: string; badge: string; stripe: string }> = {
  disponible: {
    card:   'bg-gray-50 border-gray-200',
    badge:  'bg-gray-100 text-gray-700',
    stripe: 'bg-gray-300',
  },
  reservado: {
    card:   'bg-blue-50 border-blue-200',
    badge:  'bg-blue-100 text-blue-700',
    stripe: 'bg-blue-400',
  },
  completado: {
    card:   'bg-green-50 border-green-200',
    badge:  'bg-green-100 text-green-700',
    stripe: 'bg-green-500',
  },
  cancelado: {
    card:   'bg-red-50 border-red-200',
    badge:  'bg-red-100 text-red-700',
    stripe: 'bg-red-300',
  },
}

function shiftDate(fecha: string, days: number): string {
  const date = new Date(`${fecha}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatLongDate(fecha: string): string {
  return new Date(`${fecha}T00:00:00.000Z`).toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  })
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

export function AgendaTimelineWidget({ items, fecha }: AgendaTimelineWidgetProps) {
  const previous = shiftDate(fecha, -1)
  const next     = shiftDate(fecha, +1)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold capitalize">{formatLongDate(fecha)}</h2>
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'bloque' : 'bloques'} en agenda
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={{ query: { fecha: previous } }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            ← Anterior
          </Link>
          <Link
            href={{ query: { fecha: next } }}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            Siguiente →
          </Link>
        </div>
      </div>

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
          {items.map((item) => {
            const style = STATUS_STYLES[item.status]
            const isFree = item.status === 'disponible'
            return (
              <li key={item.slotId}>
                <Card className={cn('flex flex-row gap-0 border', style.card)}>
                  <span aria-hidden className={cn('w-1.5 shrink-0 rounded-l-xl', style.stripe)} />
                  <CardContent className="flex w-full flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-mono text-sm text-muted-foreground">
                        {formatTime(item.startTime)} – {formatTime(item.endTime)}
                      </p>
                      {isFree ? (
                        <p className="text-sm italic text-gray-400">Cupo disponible</p>
                      ) : (
                        <div className="space-y-0.5">
                          <p className="text-base font-semibold">
                            {item.patientName ?? 'Paciente sin nombre'}
                          </p>
                          {item.bookingReason && (
                            <p className="text-sm text-muted-foreground">{item.bookingReason}</p>
                          )}
                          {item.status === 'completado' && item.mainDiagnosis && (
                            <p className="text-sm italic text-green-700">
                              Diagnóstico: {item.mainDiagnosis}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          style.badge,
                        )}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                      {!isFree && (
                        <span
                          aria-disabled
                          className={cn(
                            buttonVariants({ variant: 'outline', size: 'sm' }),
                            'pointer-events-none opacity-60',
                          )}
                        >
                          Ver historial
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
