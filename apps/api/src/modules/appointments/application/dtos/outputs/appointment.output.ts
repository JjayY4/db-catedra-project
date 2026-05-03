import { t, type Static } from 'elysia'

export const AppointmentOutputSchema = t.Object({
  id:            t.String(),
  eventId:       t.String(),
  patientDui:    t.String(),
  bookingReason: t.String(),
  bookedAt:      t.String(),
})

export type AppointmentOutput = Static<typeof AppointmentOutputSchema>
