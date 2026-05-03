import { injectable } from 'inversify'
import { sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IAppointmentsRepository } from '../../domain/interfaces/appointments.repository'
import type { CancelAppointmentInput } from '../dtos/inputs/cancel-appointment.input'

interface CancelAppointmentOutput {
  success: boolean
}

@injectable()
export class CancelAppointmentUseCase extends BaseUseCase<CancelAppointmentInput, CancelAppointmentOutput> {
  constructor(private readonly appointments: IAppointmentsRepository) { super() }

  protected async handle(input: CancelAppointmentInput, tx: TxClient): Promise<CancelAppointmentOutput> {
    const appointment = await this.appointments.findById(input.id, tx)
    if (!appointment) {
      throw new AppError('Cita no encontrada', 404)
    }

    await tx.execute(sql`CALL sp_cancel_appointment(${input.id}::uuid, ${input.cancelledByUserId}::uuid)`)

    return { success: true }
  }
}
