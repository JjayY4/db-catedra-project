import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { IAgendaRepository } from '../../domain/interfaces/receptionist-agenda.repository'
import type { ReceptionistAgendaItemOutput } from '../dtos/outputs/receptionist-agenda-item.output'

interface Input {
  fecha: string
}

@injectable()
export class GetDailyAgendaReceptionistUseCase
  extends BaseUseCase<Input, ReceptionistAgendaItemOutput[]> {

  constructor(private readonly agenda: IAgendaRepository) { super() }

  protected async handle(
    { fecha }: Input,
    tx: TxClient,
  ): Promise<ReceptionistAgendaItemOutput[]> {
    const slots = await this.agenda.getDailyAgendaForReceptionist(fecha, tx)
    return slots.map((slot) => ({
      slotId:             slot.slotId,
      startTime:          slot.startTime,
      endTime:            slot.endTime,
      availabilityStatus: slot.availabilityStatus,
      patientName:        slot.patientName,
      bookingReason:      slot.bookingReason,
      whatsappPhone:      slot.whatsappPhone,
      appointmentId:      slot.appointmentId,
    }))
  }
}
