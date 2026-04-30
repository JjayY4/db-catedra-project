import {injectable, inject} from "inversify";
import { IMedicalRecordsRepository } from "../../domain/interfaces/medical-records.repository";

@injectable()
export class GetMedicalHistoryUseCase {
  constructor(
    @inject("IMedicalRecordsRepository")
    private readonly repository: IMedicalRecordsRepository
  ) {}

  async execute(recordId: string) {
    const history = await this.repository.getConsultationsByRecordId(recordId);

    return history.sort((a, b) => {
        return b.id.localeCompare(a.id); 
    });
  }
}