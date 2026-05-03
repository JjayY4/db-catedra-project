import type { Container } from "inversify";
import type { AppModule } from "~/common/ioc/kernel";
import { IMedicalRecordsRepository } from "./domain/interfaces/medical-records.repository";
import { DrizzleMedicalRecordsRepository } from "./infrastructure/repositories/drizzle-medical-records.repository";
import { GetMedicalHistoryUseCase } from "./application/usecases/get-medical-history.usecase";
import { CompleteConsultationUseCase } from "./application/usecases/complete-consultation.usecase";
import { GetAppointmentDetailUseCase } from "./application/usecases/get-appointment-detail.usecase";
import { GetMyAppointmentDetailUseCase } from "./application/usecases/get-my-appointment-detail.usecase";
import { UpdateMedicalRecordUseCase } from "./application/usecases/update-medical-record.usecase";
import { GetPatientHistoryByDuiUseCase } from "./application/usecases/get-patient-history-by-dui.usecase";

export class MedicalRecordsModule implements AppModule {
  load(container: Container): void {
    container
      .bind(IMedicalRecordsRepository)
      .to(DrizzleMedicalRecordsRepository)
      .inRequestScope();

    container.bind(GetMedicalHistoryUseCase).toSelf().inRequestScope();
    container.bind(CompleteConsultationUseCase).toSelf().inRequestScope();
    container.bind(GetAppointmentDetailUseCase).toSelf().inRequestScope();
    container.bind(GetMyAppointmentDetailUseCase).toSelf().inRequestScope();
    container.bind(UpdateMedicalRecordUseCase).toSelf().inRequestScope();
    container.bind(GetPatientHistoryByDuiUseCase).toSelf().inRequestScope();
  }
}