import type { TxClient } from '@project/db/src/client'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { COVERAGE_TYPES, INSURER_NAMES } from './_data'

export type SeededInsurance = { id: string }

export async function seedMedicalInsurances(tx: TxClient): Promise<SeededInsurance[]> {
  const rows = INSURER_NAMES.map((insurerName, i) => ({
    insurerName,
    coverageType: COVERAGE_TYPES[i % COVERAGE_TYPES.length]!,
  }))

  const inserted = await tx
    .insert(MedicalInsurances)
    .values(rows)
    .returning({ id: MedicalInsurances.id })

  console.log(`  ✓ MedicalInsurances: ${inserted.length}`)
  return inserted
}
