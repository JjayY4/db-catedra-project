import { t, type Static } from 'elysia'

export const CreateInsuranceInputSchema = t.Object({
  insurerName:  t.String({ minLength: 1, maxLength: 255 }),
  coverageType: t.Union([
    t.Literal('basic'),
    t.Literal('complete'),
    t.Literal('dental'),
    t.Literal('vision'),
    t.Literal('comprehensive'),
  ]),
})

export const UpdateInsuranceInputSchema = t.Object({
  insurerName:  t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  coverageType: t.Optional(t.Union([
    t.Literal('basic'),
    t.Literal('complete'),
    t.Literal('dental'),
    t.Literal('vision'),
    t.Literal('comprehensive'),
  ])),
})

export type CreateInsuranceInput = Static<typeof CreateInsuranceInputSchema>
export type UpdateInsuranceInput = Static<typeof UpdateInsuranceInputSchema>
