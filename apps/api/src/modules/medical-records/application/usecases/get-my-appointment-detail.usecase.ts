import { injectable } from 'inversify'
import { eq, desc } from 'drizzle-orm'
import { db } from '@project/db/src/client'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { Patients } from '@project/db/src/schema/patients.schema'
import { MedicalRecords } from '@project/db/src/schema/medical-records.schema'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { AppError } from '~/common/errors/app-error'
import type { PatientAppointmentDetailOutput } from '../dtos/outputs/appointment-detail.output'

@injectable()
export class GetMyAppointmentDetailUseCase {
  async execute(userId: string, appointmentId: string): Promise<PatientAppointmentDetailOutput> {
    const [patient] = await db
      .select({ dui: Patients.dui })
      .from(Patients)
      .where(eq(Patients.userId, userId))
      .limit(1)

    if (!patient) {
      throw new AppError('Debes completar tu perfil antes de consultar esta información', 422)
    }

    const [row] = await db
      .select({
        appointmentId:      MedicalAppointments.id,
        appointmentDui:     MedicalAppointments.patientDui,
        availabilityStatus: ScheduleEvents.availabilityStatus,
        patientFirstName:   Patients.firstName,
        patientLastName:    Patients.lastName,
        recordId:           MedicalRecords.id,
      })
      .from(MedicalAppointments)
      .innerJoin(ScheduleEvents, eq(ScheduleEvents.id, MedicalAppointments.eventId))
      .innerJoin(Patients, eq(Patients.dui, MedicalAppointments.patientDui))
      .leftJoin(MedicalRecords, eq(MedicalRecords.patientDui, Patients.dui))
      .where(eq(MedicalAppointments.id, appointmentId))
      .limit(1)

    if (!row) {
      throw new AppError('Cita no encontrada', 404)
    }

    if (row.appointmentDui !== patient.dui) {
      throw new AppError('No tienes acceso a esta cita', 403)
    }

    const consultations = row.recordId
      ? await db
          .select({
            id:                  ClinicalConsultations.id,
            recordId:            ClinicalConsultations.recordId,
            appointmentId:       ClinicalConsultations.appointmentId,
            presentedSymptoms:   ClinicalConsultations.presentedSymptoms,
            bloodPressure:       ClinicalConsultations.bloodPressure,
            weightKg:            ClinicalConsultations.weightKg,
            mainDiagnosis:       ClinicalConsultations.mainDiagnosis,
            prescribedTreatment: ClinicalConsultations.prescribedTreatment,
          })
          .from(ClinicalConsultations)
          .where(eq(ClinicalConsultations.recordId, row.recordId))
          .orderBy(desc(ClinicalConsultations.id))
      : []

    return {
      appointmentId:      row.appointmentId,
      availabilityStatus: row.availabilityStatus ?? '',
      patientFirstName:   row.patientFirstName,
      patientLastName:    row.patientLastName,
      recordId:           row.recordId ?? null,
      consultations:      consultations.map((c) => ({
        id:                  c.id,
        recordId:            c.recordId,
        appointmentId:       c.appointmentId,
        presentedSymptoms:   c.presentedSymptoms,
        bloodPressure:       c.bloodPressure ?? null,
        weightKg:            c.weightKg ?? null,
        mainDiagnosis:       c.mainDiagnosis,
        prescribedTreatment: c.prescribedTreatment,
      })),
    }
  }
}
