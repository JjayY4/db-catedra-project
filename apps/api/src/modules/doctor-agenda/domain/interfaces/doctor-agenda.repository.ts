import type { TxClient } from '@project/db/src/client'
import type { IAgendaItem } from '../entities/agenda-item.entity'

export abstract class IDoctorAgendaRepository {
  abstract getDailyAgenda(doctorId: string, fecha: string, tx: TxClient): Promise<IAgendaItem[]>
}
