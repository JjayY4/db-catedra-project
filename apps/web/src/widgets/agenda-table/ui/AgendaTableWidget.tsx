import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AgendaItem {
  slotId:             string
  startTime:          string
  endTime:            string
  availabilityStatus: string
  patientName:        string | null
  bookingReason:      string | null
  whatsappPhone:      string | null
  appointmentId:      string | null
}

interface AgendaTableWidgetProps {
  items: AgendaItem[]
  fecha: string
}

const ROW_VARIANT: Record<string, string> = {
  available: 'bg-white',
  busy:      'bg-blue-50 border-l-4 border-l-blue-400',
  blocked:   'bg-amber-50 border-l-4 border-l-amber-400',
  completed: 'bg-green-50 border-l-4 border-l-green-400',
  cancelled: 'bg-red-50 border-l-4 border-l-red-300 opacity-60',
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponible',
  busy:      'Reservado',
  blocked:   'Bloqueado',
  completed: 'Atendido',
  cancelled: 'Cancelado',
}

const BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  available: 'outline',
  busy:      'default',
  blocked:   'secondary',
  completed: 'default',
  cancelled: 'destructive',
}

function formatTime(value: string): string {
  return value.length >= 5 ? value.slice(0, 5) : value
}

export function AgendaTableWidget({ items }: AgendaTableWidgetProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No hay agenda configurada para esta fecha.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const status = item.availabilityStatus
            const rowClass = ROW_VARIANT[status] ?? 'bg-white'
            const label = STATUS_LABEL[status] ?? status
            const badge = BADGE_VARIANT[status] ?? 'outline'
            return (
              <TableRow key={item.slotId} className={cn(rowClass)}>
                <TableCell className="font-medium">
                  {formatTime(item.startTime)} – {formatTime(item.endTime)}
                </TableCell>
                <TableCell>
                  <Badge variant={badge}>{label}</Badge>
                </TableCell>
                <TableCell>{item.patientName ?? '—'}</TableCell>
                <TableCell className="max-w-xs truncate">{item.bookingReason ?? '—'}</TableCell>
                <TableCell>{item.whatsappPhone ?? '—'}</TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">—</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
