import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type SlotStatus = 'available' | 'busy' | 'blocked' | 'completed' | 'cancelled' | 'pending'

export interface SlotCardProps {
  startTime: string
  endTime: string
  status: SlotStatus
  label?: string
  subLabel?: string
  actions?: React.ReactNode
}

const STATUS_LABEL: Record<SlotStatus, string> = {
  available:  'Disponible',
  busy:       'Reservado',
  blocked:    'Bloqueado',
  completed:  'Completado',
  cancelled:  'Cancelado',
  pending:    'Pendiente',
}

const STATUS_STYLES: Record<SlotStatus, { card: string; badge: string; stripe: string }> = {
  available: {
    card:   'bg-muted/40 border-border',
    badge:  'bg-muted text-muted-foreground',
    stripe: 'bg-border',
  },
  busy: {
    card:   'bg-primary/5 border-primary/30',
    badge:  'bg-primary/15 text-primary',
    stripe: 'bg-primary',
  },
  blocked: {
    card:   'bg-warning/10 border-warning/30',
    badge:  'bg-warning/15 text-warning-foreground',
    stripe: 'bg-warning',
  },
  completed: {
    card:   'bg-success/10 border-success/30',
    badge:  'bg-success/20 text-success',
    stripe: 'bg-success',
  },
  cancelled: {
    card:   'bg-destructive/10 border-destructive/30',
    badge:  'bg-destructive/15 text-destructive',
    stripe: 'bg-destructive',
  },
  pending: {
    card:   'bg-amber-500/10 border-amber-500/30',
    badge:  'bg-amber-500/15 text-amber-600',
    stripe: 'bg-amber-500',
  },
}

export function SlotCard({ startTime, endTime, status, label, subLabel, actions }: SlotCardProps) {
  const style = STATUS_STYLES[status]

  return (
    <Card className={cn('flex flex-row gap-0 border py-0', style.card)}>
      <span aria-hidden className={cn('w-1.5 shrink-0 self-stretch rounded-l-xl', style.stripe)} />
      <CardContent className="flex w-full flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-mono text-sm text-muted-foreground">
            {startTime} – {endTime}
          </p>
          {label && (
            <p className="text-base font-semibold">{label}</p>
          )}
          {subLabel && (
            <p className="text-sm italic text-muted-foreground">{subLabel}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', style.badge)}>
            {STATUS_LABEL[status]}
          </span>
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
