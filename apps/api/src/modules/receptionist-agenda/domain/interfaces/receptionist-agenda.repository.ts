import type { TxClient } from '@project/db/src/client'
import type { IAgendaSlot } from '../entities/agenda-slot.entity'

export abstract class IAgendaRepository {
  abstract getDailyAgendaForReceptionist(
    fecha: string,
    tx: TxClient,
  ): Promise<IAgendaSlot[]>
}
