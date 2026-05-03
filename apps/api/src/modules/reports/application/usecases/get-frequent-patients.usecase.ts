import { injectable } from 'inversify'
import { getFrequentPatients } from '@project/db/src/queries'

@injectable()
export class GetFrequentPatientsUseCase {
  async execute() {
    return getFrequentPatients()
  }
}
