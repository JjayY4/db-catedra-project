import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IAppointmentsRepository } from '../../domain/interfaces/appointments.repository'

interface Input {
  appointmentId: string
  doctorId:      string
}

interface Output {
  success: boolean
}

@injectable()
export class AcceptAppointmentUseCase extends BaseUseCase<Input, Output> {
  constructor(private readonly appointments: IAppointmentsRepository) { super() }

  protected async handle(input: Input, tx: TxClient): Promise<Output> {
    const appointment = await this.appointments.findByIdWithSlot(input.appointmentId, tx)
    if (!appointment) {
      throw new AppError('Cita no encontrada', 404)
    }

    if (appointment.slotStatus !== 'pending') {
      throw new AppError('Esta cita no está pendiente de aprobación', 422)
    }

    if (appointment.slotDoctorId !== input.doctorId) {
      throw new AppError('No tienes permiso para aprobar esta cita', 403)
    }

    await this.appointments.updateSlotStatus(appointment.eventId, 'busy', tx)

    return { success: true }
  }
}
