import { sql, type SQL } from 'drizzle-orm'

interface SqlExecutor {
  execute(query: SQL): Promise<unknown>
}

// Drizzle has no native trigger builder — triggers are expressed as raw DDL
// executed via db.execute(sql`...`). Each statement is separated because
// the pg driver does not support multi-statement strings in a single execute call.

const triggerStatements = [
  // Trigger 1: auto-create MedicalRecord when a Patient is inserted
  sql`
    CREATE OR REPLACE FUNCTION fn_create_medical_record_on_patient()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO "MedicalRecords" (id, "patientDui", "bloodType", "openedAt")
      VALUES (gen_random_uuid(), NEW.dui, NULL, CURRENT_DATE);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `,
  sql`DROP TRIGGER IF EXISTS trg_create_medical_record ON "Patients"`,
  sql`
    CREATE TRIGGER trg_create_medical_record
      AFTER INSERT ON "Patients"
      FOR EACH ROW
      EXECUTE FUNCTION fn_create_medical_record_on_patient()
  `,

  // Trigger 2: mark ScheduleEvent as 'pending' when an appointment is booked
  sql`
    CREATE OR REPLACE FUNCTION fn_block_event_on_appointment()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE "ScheduleEvents"
      SET "availabilityStatus" = 'pending'
      WHERE id = NEW."eventId";
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `,
  sql`DROP TRIGGER IF EXISTS trg_block_event_on_appointment ON "MedicalAppointments"`,
  sql`
    CREATE TRIGGER trg_block_event_on_appointment
      AFTER INSERT ON "MedicalAppointments"
      FOR EACH ROW
      EXECUTE FUNCTION fn_block_event_on_appointment()
  `,

  // Trigger 3: free ScheduleEvent slot back to 'available' when an appointment is deleted (cancelled)
  sql`
    CREATE OR REPLACE FUNCTION fn_free_event_on_appointment_cancel()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE "ScheduleEvents"
      SET "availabilityStatus" = 'available'
      WHERE id = OLD."eventId";
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql
  `,
  sql`DROP TRIGGER IF EXISTS trg_free_event_on_appointment_cancel ON "MedicalAppointments"`,
  sql`
    CREATE TRIGGER trg_free_event_on_appointment_cancel
      AFTER DELETE ON "MedicalAppointments"
      FOR EACH ROW
      EXECUTE FUNCTION fn_free_event_on_appointment_cancel()
  `,
]

export async function applyTriggers(db: SqlExecutor): Promise<void> {
  for (const stmt of triggerStatements) {
    await db.execute(stmt)
  }
}
