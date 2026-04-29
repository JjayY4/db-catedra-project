import { injectable } from 'inversify'
import type { TxClient } from '@project/db/src/client'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IDoctorScheduleRepository } from '../../domain/interfaces/doctor-schedule.repository'
import { calculateSlots, slotKey } from '../services/calculate-slots'
import type { GenerateScheduleInput } from '../dtos/inputs/generate-schedule.input'
import type { PreviewScheduleOutput } from '../dtos/outputs/preview-schedule.output'

@injectable()
export class PreviewWeeklyScheduleUseCase extends BaseUseCase<
  GenerateScheduleInput,
  PreviewScheduleOutput
> {
  constructor(private readonly repo: IDoctorScheduleRepository) { super() }

  protected async handle(input: GenerateScheduleInput, tx: TxClient): Promise<PreviewScheduleOutput> {
    if (input.endTime <= input.startTime) {
      throw new AppError('La hora de fin debe ser posterior a la hora de inicio', 400)
    }
    const candidates = calculateSlots(input)
    if (candidates.length === 0) {
      return { preview: [], conflicting: [] }
    }
    const conflictKeys = await this.repo.findOverlappingKeys(candidates, tx)
    const preview:     typeof candidates = []
    const conflicting: typeof candidates = []
    for (const slot of candidates) {
      if (conflictKeys.has(slotKey(slot))) conflicting.push(slot)
      else preview.push(slot)
    }
    return { preview, conflicting }
  }
}
