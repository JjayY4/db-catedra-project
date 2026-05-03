-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger 1: Auto-create MedicalRecord when a new Patient is inserted
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



-- Trigger 2: Mark schedule event as pending when appointment is booked
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
