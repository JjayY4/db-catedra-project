import { injectable } from 'inversify'
import { eq, desc } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { MedicalAppointments } from '@project/db/src/schema/medical-appointments.schema'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { IMedicalRecordsRepository, type AppointmentWithStatus } from '../../domain/interfaces/medical-records.repository'

@injectable()
export class DrizzleMedicalRecordsRepository extends IMedicalRecordsRepository {
  getConsultationsByRecordId = async (recordId: string, tx: TxClient) => {
    return await tx
      .select()
      .from(ClinicalConsultations)
      .where(eq(ClinicalConsultations.recordId, recordId))
      .orderBy(desc(ClinicalConsultations.id));
  }

  createConsultation = async (data: any, tx: TxClient) => {
    await tx.insert(ClinicalConsultations).values(data);
  }

  findAppointmentWithStatus = async (appointmentId: string, tx: TxClient): Promise<AppointmentWithStatus | null> => {
    const [row] = await tx
      .select({
        id:                 MedicalAppointments.id,
        availabilityStatus: ScheduleEvents.availabilityStatus,
      })
      .from(MedicalAppointments)
      .innerJoin(ScheduleEvents, eq(ScheduleEvents.id, MedicalAppointments.eventId))
      .where(eq(MedicalAppointments.id, appointmentId))
      .limit(1)

    return row ?? null
  }
}