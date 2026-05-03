import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IAppointmentsRepository } from '../../domain/interfaces/appointments.repository'
import { IPatientsRepository } from '~/modules/patients/domain/interfaces/patients.repository'
import type { BookOnBehalfInput } from '../dtos/inputs/book-on-behalf.input'
import type { AppointmentOutput } from '../dtos/outputs/appointment.output'

@injectable()
export class BookOnBehalfUseCase extends BaseUseCase<BookOnBehalfInput, AppointmentOutput> {
  constructor(
    private readonly appointments: IAppointmentsRepository,
    private readonly patients:     IPatientsRepository,
  ) { super() }

  protected async handle(input: BookOnBehalfInput, tx: TxClient): Promise<AppointmentOutput> {
    const patient = await this.patients.findById(input.patientDui, tx)
    if (!patient) {
      throw new AppError('Paciente no encontrado', 404)
    }

    const slot = await this.appointments.findSlotById(input.eventId, tx)
    if (!slot) {
      throw new AppError('Horario no encontrado', 404)
    }
    if (slot.availabilityStatus !== 'available') {
      throw new AppError('Este horario ya no está disponible', 409)
    }

    const appointment = await this.appointments.book(
      {
        eventId:       input.eventId,
        patientDui:    input.patientDui,
        bookingReason: input.bookingReason,
      },
      tx,
    )

    await this.appointments.updateSlotStatus(input.eventId, 'busy', tx)

    return {
      id:            appointment.id,
      eventId:       appointment.eventId,
      patientDui:    appointment.patientDui,
      bookingReason: appointment.bookingReason,
      bookedAt:      appointment.bookedAt,
    }
  }
}
