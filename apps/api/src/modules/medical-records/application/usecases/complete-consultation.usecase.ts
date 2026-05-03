import { injectable, inject } from 'inversify'
import { eq, sql } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { ClinicalConsultations } from '@project/db/src/schema/clinical-consultations.schema'
import { BaseUseCase } from '~/common/base/base-use-case.abstract'
import { AppError } from '~/common/errors/app-error'
import { IMedicalRecordsRepository } from '../../domain/interfaces/medical-records.repository'
import type { CompleteConsultationInput } from '../dtos/inputs/complete-consultation.input'
import type { ConsultationOutput } from '../dtos/outputs/consultation.output'

@injectable()
export class CompleteConsultationUseCase extends BaseUseCase<CompleteConsultationInput, ConsultationOutput> {
  constructor(
    @inject(IMedicalRecordsRepository)
    private readonly repository: IMedicalRecordsRepository,
  ) { super() }

  protected async handle(input: CompleteConsultationInput, tx: TxClient): Promise<ConsultationOutput> {
    const appointment = await this.repository.findAppointmentWithStatus(input.appointmentId, tx)
    if (!appointment) {
      throw new AppError('Cita no encontrada', 404)
    }
    if (appointment.availabilityStatus === 'completed') {
      throw new AppError('Consulta ya registrada', 422)
    }

    await tx.execute(
      sql`CALL sp_complete_consultation(
        ${input.appointmentId}::uuid,
        ${input.symptoms ?? null},
        ${input.bloodPressure ?? null},
        ${input.weight ?? null}::numeric,
        ${input.mainDiagnosis},
        ${input.prescribedTreatment ?? null},
        ${input.doctorPrivateNotes ?? null}
      )`,
    )

    const [consultation] = await tx
      .select()
      .from(ClinicalConsultations)
      .where(eq(ClinicalConsultations.appointmentId, input.appointmentId))
      .limit(1)

    if (!consultation) {
      throw new AppError('Error al registrar la consulta', 500)
    }

    return {
      id:                  consultation.id,
      recordId:            consultation.recordId,
      appointmentId:       consultation.appointmentId,
      presentedSymptoms:   consultation.presentedSymptoms,
      bloodPressure:       consultation.bloodPressure,
      weightKg:            consultation.weightKg,
      mainDiagnosis:       consultation.mainDiagnosis,
      prescribedTreatment: consultation.prescribedTreatment,
      doctorPrivateNotes:  consultation.doctorPrivateNotes,
    }
  }
}
