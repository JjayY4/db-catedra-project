import { t, type Static } from 'elysia'

export const RegisterPatientInputSchema = t.Object({
  email:       t.String({ format: 'email' }),
  password:    t.String({ minLength: 8 }),
  firstName:   t.String({ minLength: 1 }),
  lastName:    t.String({ minLength: 1 }),
  dui:         t.String({ minLength: 9, maxLength: 9 }),
  birthDate:   t.String({ minLength: 1 }),
  whatsapp:    t.String({ minLength: 8 }),
  insuranceId: t.Optional(t.Nullable(t.String())),
})

export type RegisterPatientInput = Static<typeof RegisterPatientInputSchema>
