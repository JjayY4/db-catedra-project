import type { Patient } from '@project/db/src/schema'

export type { Patient }

export interface PatientProfile {
  dui: string
  firstName: string
  lastName: string
  birthDate: string
  whatsappPhone: string
  insuranceId: string | null
}
