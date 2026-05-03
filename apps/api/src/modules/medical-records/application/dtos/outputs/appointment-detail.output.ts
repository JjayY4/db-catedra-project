import { t, type Static } from 'elysia'

export const ConsultationItemOutputSchema = t.Object({
  id:                  t.String(),
  recordId:            t.String(),
  appointmentId:       t.String(),
  presentedSymptoms:   t.String(),
  bloodPressure:       t.Nullable(t.String()),
  weightKg:            t.Nullable(t.String()),
  mainDiagnosis:       t.String(),
  prescribedTreatment: t.String(),
  doctorPrivateNotes:  t.Nullable(t.String()),
})

export const AppointmentDetailOutputSchema = t.Object({
  appointmentId:      t.String(),
  availabilityStatus: t.String(),
  patientDui:         t.String(),
  patientFirstName:   t.String(),
  patientLastName:    t.String(),
  patientBirthDate:   t.String(),
  whatsappPhone:      t.String(),
  insuranceId:        t.Nullable(t.String()),
  insuranceName:      t.Nullable(t.String()),
  insuranceCoverage:  t.Nullable(t.String()),
  recordId:           t.Nullable(t.String()),
  bloodType:          t.Nullable(t.String()),
  knownAllergies:     t.Nullable(t.String()),
  familyHistory:      t.Nullable(t.String()),
  chronicConditions:  t.Nullable(t.String()),
  openedAt:           t.Nullable(t.String()),
  consultations:      t.Array(ConsultationItemOutputSchema),
})

export type AppointmentDetailOutput = Static<typeof AppointmentDetailOutputSchema>

export const PatientConsultationItemOutputSchema = t.Object({
  id:                  t.String(),
  recordId:            t.String(),
  appointmentId:       t.String(),
  presentedSymptoms:   t.String(),
  bloodPressure:       t.Nullable(t.String()),
  weightKg:            t.Nullable(t.String()),
  mainDiagnosis:       t.String(),
  prescribedTreatment: t.String(),
})

export const PatientAppointmentDetailOutputSchema = t.Object({
  appointmentId:      t.String(),
  availabilityStatus: t.String(),
  patientFirstName:   t.String(),
  patientLastName:    t.String(),
  recordId:           t.Nullable(t.String()),
  consultations:      t.Array(PatientConsultationItemOutputSchema),
})

export type PatientAppointmentDetailOutput = Static<typeof PatientAppointmentDetailOutputSchema>
