import { sql } from 'drizzle-orm'
import { db } from '../client'

export interface AvailableSlot {
  id: string
  eventDate: string
  startTime: string
  endTime: string
}

export interface AvailabilitySlot {
  event_id: string
  doctor_id: string
  event_date: string
  start_time: string
  end_time: string
}

export interface PatientHistoryRow {
  dui: string
  firstName: string
  lastName: string
  birthDate: string
  whatsappPhone: string
  insurerName: string | null
  coverageType: string | null
  recordId: string | null
  bloodType: string | null
  knownAllergies: string | null
  familyHistory: string | null
  chronicConditions: string | null
  recordOpenedAt: string | null
  consultationId: string | null
  consultationDate: string | null
  appointmentId: string | null
  presentedSymptoms: string | null
  bloodPressure: string | null
  weightKg: number | null
  mainDiagnosis: string | null
  prescribedTreatment: string | null
  doctorPrivateNotes: string | null
}

/**
 * sp_get_available_slots — returns available appointment slots for a given date.
 * Called by: receptionist / patient booking screen.
 */
export async function getAvailableSlots(date: string): Promise<AvailableSlot[]> {
  const result = await db.execute(
    sql`SELECT * FROM sp_get_available_slots(${date}::date)`
  )
  return result.rows as unknown as AvailableSlot[]
}

/**
 * sp_book_appointment — books an existing available slot for a patient.
 * Called by: receptionist when creating a new appointment.
 * Triggers: trg_block_event_on_appointment sets the slot to 'pending'.
 */
export async function bookAppointment(
  eventId: string,
  patientDui: string,
  bookingReason: string,
  auditUserId: string
): Promise<void> {
  await db.execute(
    sql`CALL sp_book_appointment(
      ${eventId}::uuid,
      ${patientDui},
      ${bookingReason},
      ${auditUserId}::uuid
    )`
  )
}

/**
 * sp_cancel_appointment — cancels an appointment and frees the slot.
 * Called by: receptionist or doctor when cancelling an appointment.
 * Triggers: trg_free_event_on_appointment_cancel sets the slot back to 'available'.
 */
export async function cancelAppointment(
  appointmentId: string,
  cancelledBy: string
): Promise<void> {
  await db.execute(
    sql`CALL sp_cancel_appointment(
      ${appointmentId}::uuid,
      ${cancelledBy}::uuid
    )`
  )
}

/**
 * sp_complete_consultation — registers a consultation and closes the appointment slot.
 * Called by: doctor at the end of a consultation session.
 */
export async function completeConsultation(
  appointmentId: string,
  symptoms: string,
  bloodPressure: string,
  weightKg: number,
  diagnosis: string,
  treatment: string,
  privateNotes: string | null
): Promise<void> {
  await db.execute(
    sql`CALL sp_complete_consultation(
      ${appointmentId}::uuid,
      ${symptoms},
      ${bloodPressure},
      ${weightKg},
      ${diagnosis},
      ${treatment},
      ${privateNotes}
    )`
  )
}

/**
 * sp_get_patient_history — returns full patient history with all consultations.
 * Called by: doctor during consultation; medical records page.
 */
export async function getPatientHistory(dui: string): Promise<PatientHistoryRow[]> {
  const result = await db.execute(
    sql`SELECT * FROM sp_get_patient_history(${dui})`
  )
  return result.rows as unknown as PatientHistoryRow[]
}

/**
 * sp_check_availability — returns available slots for a date, including doctorId.
 * Called by: receptionist schedule overview; availability checks filtered by doctor.
 */
export async function checkAvailability(date: string): Promise<AvailabilitySlot[]> {
  const result = await db.execute(
    sql`SELECT * FROM sp_check_availability(${date}::date)`
  )
  return result.rows as unknown as AvailabilitySlot[]
}
