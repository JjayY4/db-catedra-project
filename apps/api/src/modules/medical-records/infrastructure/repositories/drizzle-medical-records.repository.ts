import { inject, injectable } from "inversify";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres"; 
import { ClinicalConsultations } from "@project/db/src/schema/clinical-consultations.schema";
import { IMedicalRecordsRepository } from "../../domain/interfaces/medical-records.repository";

@injectable()
export class DrizzleMedicalRecordsRepository implements IMedicalRecordsRepository {
  constructor(
    @inject("DB") private readonly db: NodePgDatabase<any>
) {}

  async getConsultationsByRecordId(recordId: string) {
    return await this.db
      .select()
      .from(ClinicalConsultations)
      .where(eq(ClinicalConsultations.recordId, recordId));
  }

  async createConsultation(data: any) {
    await this.db.insert(ClinicalConsultations).values(data);
  }
}