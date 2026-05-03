export {
  getFrequentPatients,
  getWeeklyAvailability,
  findAppointmentsWithoutConsultation,
  getCancelledAppointmentsPerDoctor,
} from './subqueries'
export type {
  FrequentPatient,
  DailyAvailability,
  AppointmentWithoutConsultation,
  CancelledAppointmentsPerDoctor,
} from './subqueries'

export {
  getAvailableSlots,
  bookAppointment,
  cancelAppointment,
  completeConsultation,
  getPatientHistory,
  checkAvailability,
} from './stored-procedures'
export type {
  AvailableSlot,
  AvailabilitySlot,
  PatientHistoryRow,
} from './stored-procedures'
