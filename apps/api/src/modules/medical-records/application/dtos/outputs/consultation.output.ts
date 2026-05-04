export interface ConsultationOutput {
  id:                   string
  recordId:             string
  appointmentId:        string
  presentedSymptoms:    string | null
  bloodPressure:        string | null
  weightKg:             string | null
  mainDiagnosis:        string
  prescribedTreatment:  string | null
  doctorPrivateNotes:   string | null
}
