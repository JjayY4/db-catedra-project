import { injectable, inject } from "inversify";
import { eq } from "drizzle-orm";
import { IMedicalRecordsRepository } from "../../domain/interfaces/medical-records.repository";
import { db } from "@project/db/src/client";
import { MedicalRecords } from "@project/db/src/schema/medical-records.schema";

@injectable()
export class GetMedicalHistoryUseCase {
  constructor(
    @inject(IMedicalRecordsRepository)
    private readonly repository: IMedicalRecordsRepository
  ) {}

  async execute(recordId: string) {
    return await db.transaction(async (tx) => {
      const [background] = await tx
        .select()
        .from(MedicalRecords)
        .where(eq(MedicalRecords.id, recordId))
        .limit(1);

      const consultations = await this.repository.getConsultationsByRecordId(recordId, tx);

      return {
        background: background ?? null,
        consultations: consultations.sort((a, b) => b.id.localeCompare(a.id)),
      };
    });
  }
}