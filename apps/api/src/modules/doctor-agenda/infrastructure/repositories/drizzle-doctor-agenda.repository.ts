import { injectable } from 'inversify'
import { asc, eq, inArray } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { DailyScheduleView } from '@project/db/src/schema/views'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { IDoctorAgendaRepository } from '../../domain/interfaces/doctor-agenda.repository'
import type { AgendaStatus, IAgendaItem } from '../../domain/entities/agenda-item.entity'

type ViewRow = {
  eventId:            string | null
  startTime:          string | null
  endTime:            string | null
  availabilityStatus: string | null
  appointmentId:      string | null
  bookingReason:      string | null
  patientDui:         string | null
  firstName:          string | null
  lastName:           string | null
}

function mapStatus(value: string | null): AgendaStatus {
  switch (value) {
    case 'busy':      return 'reservado'
    case 'completed': return 'completado'
    case 'cancelled': return 'cancelado'
    default:          return 'disponible'
  }
}

function buildPatientName(row: ViewRow): string | null {
  if (!row.firstName && !row.lastName) return null
  return [row.firstName, row.lastName].filter(Boolean).join(' ').trim() || null
}

function toEntity(row: ViewRow, diagnoses: Map<string, string>): IAgendaItem {
  const status = mapStatus(row.availabilityStatus)
  const diagnosis = row.appointmentId ? diagnoses.get(row.appointmentId) ?? null : null
  return {
    slotId:        row.eventId ?? '',
    startTime:     row.startTime ?? '',
    endTime:       row.endTime ?? '',
    patientId:     row.patientDui ?? null,
    patientName:   buildPatientName(row),
    bookingReason: row.bookingReason ?? null,
    status,
    mainDiagnosis: status === 'completado' ? diagnosis : null,
  }
}

@injectable()
export class DrizzleDoctorAgendaRepository extends IDoctorAgendaRepository {
  getDailyAgenda = async (fecha: string, tx: TxClient): Promise<IAgendaItem[]> => {
    const rows = await tx
      .select({
        eventId:            DailyScheduleView.eventId,
        startTime:          DailyScheduleView.startTime,
        endTime:            DailyScheduleView.endTime,
        availabilityStatus: DailyScheduleView.availabilityStatus,
        appointmentId:      DailyScheduleView.appointmentId,
        bookingReason:      DailyScheduleView.bookingReason,
        patientDui:         DailyScheduleView.patientDui,
        firstName:          DailyScheduleView.firstName,
        lastName:           DailyScheduleView.lastName,
      })
      .from(DailyScheduleView)
      .where(eq(DailyScheduleView.eventDate, fecha))
      .orderBy(asc(DailyScheduleView.startTime))

    const appointmentIds = rows
      .map((r) => r.appointmentId)
      .filter((id): id is string => Boolean(id))

    const diagnoses = new Map<string, string>()
    if (appointmentIds.length > 0) {
      const consultations = await tx
        .select({
          appointmentId: ClinicalConsultations.appointmentId,
          mainDiagnosis: ClinicalConsultations.mainDiagnosis,
        })
        .from(ClinicalConsultations)
        .where(inArray(ClinicalConsultations.appointmentId, appointmentIds))

      for (const c of consultations) {
        diagnoses.set(c.appointmentId, c.mainDiagnosis)
      }
    }

    return rows.map((r) => toEntity(r as ViewRow, diagnoses))
  }
}
