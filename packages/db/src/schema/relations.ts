import { relations } from 'drizzle-orm'
import { Users }                  from './iam.schema'
import { Patients }               from './patients.schema'
import { MedicalInsurances }      from './medical-insurances.schema'
import { MedicalRecords }         from './medical-records.schema'
import { ScheduleEvents }         from './schedule-events.schema'
import { MedicalAppointments }    from './medical-appointments.schema'
import { ClinicalConsultations }  from './clinical-consultations.schema'
import { WhatsAppMessages }       from './whatsapp-messages.schema'

export const usersRelations = relations(Users, ({ many }) => ({
  patients:      many(Patients),
  auditedEvents: many(ScheduleEvents),
}))

export const medicalInsurancesRelations = relations(MedicalInsurances, ({ many }) => ({
  patients: many(Patients),
}))

export const patientsRelations = relations(Patients, ({ one, many }) => ({
  user:          one(Users,             { fields: [Patients.userId],      references: [Users.id] }),
  insurance:     one(MedicalInsurances, { fields: [Patients.insuranceId], references: [MedicalInsurances.id] }),
  medicalRecord: one(MedicalRecords),
  appointments:  many(MedicalAppointments),
}))

export const medicalRecordsRelations = relations(MedicalRecords, ({ one, many }) => ({
  patient:       one(Patients, { fields: [MedicalRecords.patientDui], references: [Patients.dui] }),
  consultations: many(ClinicalConsultations),
}))

export const scheduleEventsRelations = relations(ScheduleEvents, ({ one }) => ({
  auditUser:   one(Users, { fields: [ScheduleEvents.auditUserId], references: [Users.id] }),
  appointment: one(MedicalAppointments),
}))

export const medicalAppointmentsRelations = relations(MedicalAppointments, ({ one, many }) => ({
  event:            one(ScheduleEvents, { fields: [MedicalAppointments.eventId],    references: [ScheduleEvents.id] }),
  patient:          one(Patients,       { fields: [MedicalAppointments.patientDui], references: [Patients.dui] }),
  consultation:     one(ClinicalConsultations),
  whatsappMessages: many(WhatsAppMessages),
}))

export const clinicalConsultationsRelations = relations(ClinicalConsultations, ({ one }) => ({
  record:      one(MedicalRecords,      { fields: [ClinicalConsultations.recordId],      references: [MedicalRecords.id] }),
  appointment: one(MedicalAppointments, { fields: [ClinicalConsultations.appointmentId], references: [MedicalAppointments.id] }),
}))

export const whatsappMessagesRelations = relations(WhatsAppMessages, ({ one }) => ({
  appointment: one(MedicalAppointments, { fields: [WhatsAppMessages.appointmentId], references: [MedicalAppointments.id] }),
}))
