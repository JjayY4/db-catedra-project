import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IScheduleEventsRepository } from '../../domain/interfaces/receptionist-schedule.repository'

interface Input {
  id: string
}

@injectable()
export class DeleteBlockUseCase extends BaseUseCase<Input, void> {
  constructor(private readonly events: IScheduleEventsRepository) { super() }

  protected async handle({ id }: Input, tx: TxClient): Promise<void> {
    const event = await this.events.findById(id, tx)
    if (!event) throw new AppError('Bloqueo no encontrado', 404)

    const conflict = await this.events.findActiveAppointmentForEvent(id, tx)
    if (conflict) {
      throw new AppError('Este slot tiene una cita asociada', 409)
    }

    await this.events.deleteById(id, tx)
  }
}
