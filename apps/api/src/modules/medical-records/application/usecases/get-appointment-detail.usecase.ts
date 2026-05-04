import { injectable } from 'inversify'
import { eq, desc } from 'drizzle-orm'
import { db } from '@project/db/src/client'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { Patients } from '@project/db/src/schema/patients.schema'
import { MedicalRecords } from '@project/db/src/schema/medical-records.schema'
import { MedicalInsurances } from '@project/db/src/schema/medical-insurances.schema'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { AppError } from '~/common/errors/app-error'
import { pgDateToIsoDateString } from '~/common/utils/date'
import type { AppointmentDetailOutput } from '../dtos/outputs/appointment-detail.output'

@injectable()
export class GetAppointmentDetailUseCase {
  async execute(appointmentId: string): Promise<AppointmentDetailOutput> {
    const [row] = await db
      .select({
        appointmentId:      MedicalAppointments.id,
        availabilityStatus: ScheduleEvents.availabilityStatus,
        patientDui:         Patients.dui,
        patientFirstName:   Patients.firstName,
        patientLastName:    Patients.lastName,
        patientBirthDate:   Patients.birthDate,
        whatsappPhone:      Patients.whatsappPhone,
        insuranceId:        Patients.insuranceId,
        insuranceName:      MedicalInsurances.insurerName,
        insuranceCoverage:  MedicalInsurances.coverageType,
        recordId:           MedicalRecords.id,
        bloodType:          MedicalRecords.bloodType,
        knownAllergies:     MedicalRecords.knownAllergies,
        familyHistory:      MedicalRecords.familyHistory,
        chronicConditions:  MedicalRecords.chronicConditions,
        openedAt:           MedicalRecords.openedAt,
      })
      .from(MedicalAppointments)
      .innerJoin(ScheduleEvents, eq(ScheduleEvents.id, MedicalAppointments.eventId))
      .innerJoin(Patients, eq(Patients.dui, MedicalAppointments.patientDui))
      .leftJoin(MedicalRecords, eq(MedicalRecords.patientDui, Patients.dui))
      .leftJoin(MedicalInsurances, eq(MedicalInsurances.id, Patients.insuranceId))
      .where(eq(MedicalAppointments.id, appointmentId))
      .limit(1)

    if (!row) {
      throw new AppError('Cita no encontrada', 404)
    }

    const consultations = row.recordId
      ? await db
          .select()
          .from(ClinicalConsultations)
          .where(eq(ClinicalConsultations.recordId, row.recordId))
          .orderBy(desc(ClinicalConsultations.id))
      : []

    return {
      appointmentId:      row.appointmentId,
      availabilityStatus: row.availabilityStatus ?? '',
      patientDui:         row.patientDui,
      patientFirstName:   row.patientFirstName,
      patientLastName:    row.patientLastName,
      patientBirthDate:   pgDateToIsoDateString(row.patientBirthDate),
      whatsappPhone:      row.whatsappPhone,
      insuranceId:        row.insuranceId ?? null,
      insuranceName:      row.insuranceName ?? null,
      insuranceCoverage:  row.insuranceCoverage ?? null,
      recordId:           row.recordId ?? null,
      bloodType:          row.bloodType ?? null,
      knownAllergies:     row.knownAllergies ?? null,
      familyHistory:      row.familyHistory ?? null,
      chronicConditions:  row.chronicConditions ?? null,
      openedAt:           row.openedAt == null ? null : pgDateToIsoDateString(row.openedAt),
      consultations: consultations.map((c) => ({
        id:                  c.id,
        recordId:            c.recordId,
        appointmentId:       c.appointmentId,
        presentedSymptoms:   c.presentedSymptoms,
        bloodPressure:       c.bloodPressure ?? null,
        weightKg:            c.weightKg ?? null,
        mainDiagnosis:       c.mainDiagnosis,
        prescribedTreatment: c.prescribedTreatment,
        doctorPrivateNotes:  c.doctorPrivateNotes ?? null,
      })),
    }
  }
}
