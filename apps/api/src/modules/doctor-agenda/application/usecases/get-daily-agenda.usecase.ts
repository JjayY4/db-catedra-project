import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IDoctorAgendaRepository } from '../../domain/interfaces/doctor-agenda.repository'
import type { AgendaItemOutput } from '../dtos/outputs/agenda-item.output'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

@injectable()
export class GetDailyAgendaUseCase extends BaseUseCase<{ fecha: string }, AgendaItemOutput[]> {
  constructor(private readonly repo: IDoctorAgendaRepository) { super() }

  protected async handle({ fecha }: { fecha: string }, tx: TxClient): Promise<AgendaItemOutput[]> {
    if (!DATE_PATTERN.test(fecha)) {
      throw new AppError('Formato de fecha inválido. Use YYYY-MM-DD', 400)
    }
    const items = await this.repo.getDailyAgenda(fecha, tx)
    return items.map((item) => ({
      slotId:        item.slotId,
      startTime:     item.startTime,
      endTime:       item.endTime,
      patientId:     item.patientId ?? null,
      patientName:   item.patientName ?? null,
      bookingReason: item.bookingReason ?? null,
      status:        item.status,
      mainDiagnosis: item.mainDiagnosis ?? null,
    }))
  }
}
