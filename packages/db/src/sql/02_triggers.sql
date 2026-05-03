-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Auto-create MedicalRecord when a new Patient is inserted
-- Fired: AFTER INSERT ON "Patients"
CREATE OR REPLACE FUNCTION fn_create_medical_record_on_patient()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "MedicalRecords" (id, "patientDui", "bloodType", "openedAt")
  VALUES (gen_random_uuid(), NEW.dui, NULL, CURRENT_DATE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_create_medical_record ON "Patients";
CREATE TRIGGER trg_create_medical_record
  AFTER INSERT ON "Patients"
  FOR EACH ROW
  EXECUTE FUNCTION fn_create_medical_record_on_patient();


-- Trigger 2: Mark ScheduleEvent as 'pending' when an appointment is booked
-- Fired: AFTER INSERT ON "MedicalAppointments"
CREATE OR REPLACE FUNCTION fn_block_event_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "ScheduleEvents"
  SET "availabilityStatus" = 'pending'
  WHERE id = NEW."eventId";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_event_on_appointment ON "MedicalAppointments";
CREATE TRIGGER trg_block_event_on_appointment
  AFTER INSERT ON "MedicalAppointments"
  FOR EACH ROW
  EXECUTE FUNCTION fn_block_event_on_appointment();


-- Trigger 3: Free ScheduleEvent slot back to 'available' when an appointment is cancelled
-- Fired: AFTER DELETE ON "MedicalAppointments"
CREATE OR REPLACE FUNCTION fn_free_event_on_appointment_cancel()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "ScheduleEvents"
  SET "availabilityStatus" = 'available'
  WHERE id = OLD."eventId";
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_free_event_on_appointment_cancel ON "MedicalAppointments";
CREATE TRIGGER trg_free_event_on_appointment_cancel
  AFTER DELETE ON "MedicalAppointments"
  FOR EACH ROW
  EXECUTE FUNCTION fn_free_event_on_appointment_cancel();
