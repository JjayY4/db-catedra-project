import type { TxClient } from '@project/db/src/client'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { MedicalRecords } from '@project/db/src/schema/medical-records.schema'
import { DIAGNOSES, PRESENTED_SYMPTOMS } from './_data'
import type { SeededAppointment } from './medical-appointments.seed'

export type SeededConsultation = { id: string }

export async function seedClinicalConsultations(
  tx: TxClient,
  appointments: SeededAppointment[],
): Promise<SeededConsultation[]> {
  // Look up the auto-created MedicalRecord for each patient (1:1 by DUI).
  const records = await tx
    .select({ id: MedicalRecords.id, patientDui: MedicalRecords.patientDui })
    .from(MedicalRecords)
  const recordByDui = new Map(records.map((r) => [r.patientDui, r.id]))

  const rows = appointments.map((appt, i) => {
    const recordId = recordByDui.get(appt.patientDui)
    if (!recordId) throw new Error(`No MedicalRecord for DUI ${appt.patientDui}`)
    const dx = DIAGNOSES[i % DIAGNOSES.length]!
    return {
      recordId,
      appointmentId:       appt.id,
      presentedSymptoms:   PRESENTED_SYMPTOMS[i % PRESENTED_SYMPTOMS.length]!,
      bloodPressure:       `${110 + (i % 20)}/${70 + (i % 15)}`,
      weightKg:            String(60 + (i % 30)),
      mainDiagnosis:       dx.dx,
      prescribedTreatment: dx.tx,
      doctorPrivateNotes:  i % 3 === 0 ? 'Paciente colaborador; reevaluar en 30 días.' : null,
    }
  })

  const inserted = await tx
    .insert(ClinicalConsultations)
    .values(rows)
    .returning({ id: ClinicalConsultations.id })

  console.log(`  ✓ ClinicalConsultations: ${inserted.length}`)
  return inserted
}
