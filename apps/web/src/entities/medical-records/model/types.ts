export interface ClinicalConsultation {
  id: string
  recordId: string
  appointmentId: string | null
  presentedSymptoms: string
  bloodPressure: string | null
  weightKg: string | null
  mainDiagnosis: string
  prescribedTreatment: string
  doctorPrivateNotes: string | null
}

export interface MedicalHistoryResponse {
  success: boolean
  data: ClinicalConsultation[]
}