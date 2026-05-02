import { sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { WhatsAppMessages } from '@project/db/src/schema/whatsapp-messages.schema'
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

  // trg_whatsapp_on_appointment fired once per appointment row
  // trg_block_event_on_appointment marked all 25 events as 'busy'
  const [{ count }] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(WhatsAppMessages)

  if (Number(count) !== inserted.length) {
    throw new Error(`Expected ${inserted.length} WhatsAppMessages, got ${count}`)
  }

  // Promote past 'busy' events to 'completed' so consultations match domain semantics.
  await tx.execute(sql`
    UPDATE ${ScheduleEvents}
    SET ${sql.identifier('availabilityStatus')} = 'completed'
    WHERE ${ScheduleEvents.id} IN (${sql.join(inserted.map((r) => sql`${r.eventId}`), sql`, `)})
  `)

  console.log(`  ✓ MedicalAppointments: ${inserted.length}`)
  console.log(`  ✓ WhatsAppMessages: ${count} (via trg_whatsapp_on_appointment)`)
  console.log(`  ✓ ScheduleEvents → 'completed': ${inserted.length}`)

  return inserted
}
