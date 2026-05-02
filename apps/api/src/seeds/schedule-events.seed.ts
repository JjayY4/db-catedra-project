import type { TxClient } from '@project/db/src/client'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { addDays, fmtDate, fmtTime, today } from './_helpers'
import type { SeededUser } from './users.seed'

export type SeededEvent = { id: string }

export async function seedScheduleEvents(
  tx: TxClient,
  users: SeededUser[],
): Promise<SeededEvent[]> {
  const doctors       = users.filter((u) => u.role === 'doctor')
  const receptionists = users.filter((u) => u.role === 'receptionist')
  const auditors      = [...doctors, ...receptionists]

  if (doctors.length === 0)      throw new Error('Cannot seed events: no doctor users')
  if (auditors.length === 0)     throw new Error('Cannot seed events: no audit users')

  const base = today()

  // 25 historical appointment slots, 1 per doctor-day rotating across 8 doctors.
  // All start as 'available' — the appointments seeder triggers will flip them
  // to 'busy', then the orchestrator sets them to 'completed' for consultations.
  const rows = Array.from({ length: 25 }, (_, i) => {
    const offsetDays = -(i + 1)
    const hour = 8 + (i % 8)
    return {
      eventDate:          fmtDate(addDays(base, offsetDays)),
      startTime:          fmtTime(hour),
      endTime:            fmtTime(hour + 1),
      eventType:          'appointment' as const,
      availabilityStatus: 'available' as const,
      doctorId:           doctors[i % doctors.length]!.id,
      auditUserId:        auditors[i % auditors.length]!.id,
    }
  })

  const inserted = await tx
    .insert(ScheduleEvents)
    .values(rows)
    .returning({ id: ScheduleEvents.id })

  console.log(`  ✓ ScheduleEvents: ${inserted.length}`)
  return inserted
}
