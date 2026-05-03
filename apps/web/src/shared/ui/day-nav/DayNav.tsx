import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export interface DayNavProps {
  fecha: string
  buildHref: (fecha: string) => string
  title?: string
  subtitle?: string
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

export function DayNav({ fecha, buildHref, title, subtitle }: DayNavProps) {
  const previous = shiftDate(fecha, -1)
  const next     = shiftDate(fecha, +1)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href={buildHref(previous)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        ← Anterior
      </Link>
      <div className="text-center">
        <h2 className="text-xl font-semibold capitalize">{title ?? formatLongDate(fecha)}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <Link href={buildHref(next)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
        Siguiente →
      </Link>
    </div>
  )
}
