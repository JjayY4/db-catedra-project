import type { TxClient } from '@project/db/src/client'
import { IBaseRepository } from '~/common/base/base-repository.abstract'
import type { RepositoryMethod } from '~/common/base/repository-method.type'
import type { IAppointment } from '../entities/appointment.entity'

export interface AppointmentWithEvent extends IAppointment {
  eventDate:          string
  startTime:          string
  endTime:            string
  availabilityStatus: string
  mainDiagnosis:       string | null
  prescribedTreatment: string | null
}

export interface PaginationInput {
  page:     number
  pageSize: number
}

export interface BookAppointmentData {
  eventId:       string
  patientDui:    string
  bookingReason: string
}

export abstract class IAppointmentsRepository extends IBaseRepository<IAppointment> {
  abstract findByEventId:    RepositoryMethod<[eventId: string], IAppointment | null>
  abstract book:             (data: BookAppointmentData, tx: TxClient) => Promise<IAppointment>
  abstract findByPatientDui: (
    patientDui: string,
    pagination: PaginationInput,
    tx: TxClient,
  ) => Promise<{ items: AppointmentWithEvent[]; total: number }>
}
