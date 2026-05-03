import { t, type Static } from 'elysia'

export const UpdateMedicalRecordInputSchema = t.Object({
  bloodType:         t.Optional(t.Nullable(t.Union([
    t.Literal('A+'), t.Literal('A-'),
    t.Literal('B+'), t.Literal('B-'),
    t.Literal('AB+'), t.Literal('AB-'),
    t.Literal('O+'), t.Literal('O-'),
  ]))),
  knownAllergies:    t.Optional(t.Nullable(t.String())),
  familyHistory:     t.Optional(t.Nullable(t.String())),
  chronicConditions: t.Optional(t.Nullable(t.String())),
})

export type UpdateMedicalRecordInput = Static<typeof UpdateMedicalRecordInputSchema>
