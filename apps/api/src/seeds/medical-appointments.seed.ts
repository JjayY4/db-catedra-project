import { sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { BOOKING_REASONS, DUIS } from './_data'
import type { SeededEvent } from './schedule-events.seed'

export type SeededAppointment = { id: string; eventId: string; patientDui: string }

export async function seedMedicalAppointments(
  tx: TxClient,
  events: SeededEvent[],
): Promise<SeededAppointment[]> {
  if (events.length < 25) {
    throw new Error(`Need 25 ScheduleEvents, got ${events.length}`)
  }

  const rows = events.slice(0, 25).map((evt, i) => ({
    eventId:       evt.id,
    patientDui:    DUIS[i]!,
    bookingReason: BOOKING_REASONS[i % BOOKING_REASONS.length]!,
  }))

  const inserted = await tx
    .insert(MedicalAppointments)
    .values(rows)
    .returning({
      id:         MedicalAppointments.id,
      eventId:    MedicalAppointments.eventId,
      patientDui: MedicalAppointments.patientDui,
    })

  // Promote past 'busy' events to 'completed' so consultations match domain semantics.
  await tx.execute(sql`
    UPDATE ${ScheduleEvents}
    SET ${sql.identifier('availabilityStatus')} = 'completed'
    WHERE ${ScheduleEvents.id} IN (${sql.join(inserted.map((r) => sql`${r.eventId}`), sql`, `)})
  `)

  console.log(`  ✓ MedicalAppointments: ${inserted.length}`)
  console.log(`  ✓ ScheduleEvents → 'completed': ${inserted.length}`)

  return inserted
}
