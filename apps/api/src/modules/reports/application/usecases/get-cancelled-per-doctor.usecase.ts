import { injectable } from 'inversify'
import { getCancelledAppointmentsPerDoctor } from '@project/db/src/queries'

@injectable()
export class GetCancelledPerDoctorUseCase {
  async execute() {
    return getCancelledAppointmentsPerDoctor()
  }
}
