import { injectable } from 'inversify'
import { findAppointmentsWithoutConsultation } from '@project/db/src/queries'

@injectable()
export class GetPendingConsultationsUseCase {
  async execute() {
    return findAppointmentsWithoutConsultation()
  }
}
