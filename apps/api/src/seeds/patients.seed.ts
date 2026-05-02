import type { TxClient } from '@project/db/src/client'
import { Patients } from '@project/db/src/schema/patients.schema'
import { DUIS, FIRST_NAMES, LAST_NAMES } from './_data'
import { fmtDate } from './_helpers'
import type { SeededUser } from './users.seed'
import type { SeededInsurance } from './medical-insurances.seed'

export type SeededPatient = { dui: string; userId: string | null }

export async function seedPatients(
  tx: TxClient,
  users: SeededUser[],
  insurances: SeededInsurance[],
): Promise<SeededPatient[]> {
  const patientUsers = users.filter((u) => u.role === 'patient')

  const rows = DUIS.map((dui, i) => {
    // Link the first 12 patient rows to patient-role users (1:1).
    const linkedUser = i < patientUsers.length ? patientUsers[i] : null
    const insurance  = insurances[i % insurances.length]!
    return {
      dui,
      userId:        linkedUser?.id ?? null,
      firstName:     FIRST_NAMES[i % FIRST_NAMES.length]!,
      lastName:      LAST_NAMES[(i + 3) % LAST_NAMES.length]!,
      whatsappPhone: `+5037${String(1000000 + i).padStart(7, '0')}`,
      birthDate:     fmtDate(new Date(1970 + (i % 40), i % 12, (i % 27) + 1)),
      insuranceId:   insurance.id,
    }
  })

  await tx.insert(Patients).values(rows)

  // Trigger `trg_create_medical_record` auto-creates 25 MedicalRecords here.
  console.log(`  ✓ Patients: ${rows.length} (12 linked to users, 13 unlinked)`)
  console.log(`  ✓ MedicalRecords: ${rows.length} (via trg_create_medical_record)`)

  return rows.map((r) => ({ dui: r.dui, userId: r.userId }))
}
