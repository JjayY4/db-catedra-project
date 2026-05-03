import { t, type Static } from 'elysia'

export const PatientOutputSchema = t.Object({
  dui:               t.String(),
  userId:            t.Nullable(t.String()),
  firstName:         t.String(),
  lastName:          t.String(),
  whatsappPhone:     t.String(),
  birthDate:         t.String(),
  insuranceId:       t.Nullable(t.String()),
  recordId:          t.Nullable(t.String()),
  insuranceName:     t.Nullable(t.String()),
  insuranceCoverage: t.Nullable(t.String()),
})

export type PatientOutput = Static<typeof PatientOutputSchema>

export const PaginatedPatientsOutputSchema = t.Object({
  items:    t.Array(PatientOutputSchema),
  total:    t.Number(),
  page:     t.Number(),
  pageSize: t.Number(),
})

export type PaginatedPatientsOutput = Static<typeof PaginatedPatientsOutputSchema>
