export type AgendaStatus = 'disponible' | 'pendiente' | 'reservado' | 'completado' | 'cancelado' | 'bloqueado'

export interface IAgendaItem {
  slotId:          string
  startTime:       string
  endTime:         string
  patientId?:      string | null
  patientName?:    string | null
  bookingReason?:  string | null
  status:          AgendaStatus
  mainDiagnosis?:  string | null
  appointmentId?:  string | null
}
