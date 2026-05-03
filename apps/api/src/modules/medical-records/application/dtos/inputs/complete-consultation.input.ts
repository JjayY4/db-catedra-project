export interface CompleteConsultationInput {
  appointmentId:        string
  doctorId:             string
  symptoms?:            string
  bloodPressure?:       string
  weight?:              number
  mainDiagnosis:        string
  prescribedTreatment?: string
  doctorPrivateNotes?:  string
}
