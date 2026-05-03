import { t, type Static } from 'elysia'

export const BookOnBehalfInputSchema = t.Object({
  eventId:       t.String({ format: 'uuid' }),
  patientDui:    t.String({ minLength: 1 }),
  bookingReason: t.String({ minLength: 1, maxLength: 500 }),
})

export type BookOnBehalfInput = Static<typeof BookOnBehalfInputSchema>
