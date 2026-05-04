import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IReceptionistScheduleRepository } from '../../domain/interfaces/receptionist-schedule.repository'

interface Input {
  id: string
}

interface Output {
  success: boolean
}

@injectable()
export class DeleteBlockUseCase extends BaseUseCase<Input, Output> {
  constructor(private readonly events: IReceptionistScheduleRepository) { super() }

  protected async handle({ id }: Input, tx: TxClient): Promise<Output> {
    const event = await this.events.findById(id, tx)
    if (!event) throw new AppError('Bloqueo no encontrado', 404)

    const activeConflict = await this.events.findActiveAppointmentForEvent(id, tx)
    if (activeConflict) {
      throw new AppError('Este slot tiene una cita activa', 409)
    }

    await this.events.restoreToAvailable(id, tx)
    return { success: true }
  }
}
