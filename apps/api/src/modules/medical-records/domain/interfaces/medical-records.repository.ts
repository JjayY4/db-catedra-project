import { ClinicalConsultation } from "@project/db/src/schema/clinical-consultations.schema";

export abstract class IMedicalRecordsRepository {
  abstract getConsultationsByRecordId(recordId: string): Promise<ClinicalConsultation[]>;
  abstract createConsultation(data: any): Promise<void>;
}