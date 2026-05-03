import { injectable } from 'inversify'
import { getWeeklyAvailability } from '@project/db/src/queries'

@injectable()
export class GetWeeklyAvailabilityUseCase {
  async execute() {
    return getWeeklyAvailability()
  }
}
