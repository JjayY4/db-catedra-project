-- =============================================================================
-- Stored Procedures — Sistema de Citas Medicas
--
-- Convenciones:
--   * Los identificadores de tablas/columnas son case-sensitive (PascalCase
--     y camelCase) por lo que SIEMPRE se citan con comillas dobles.
--   * Los SP de solo lectura se exponen como FUNCTIONS RETURNS TABLE para
--     poder consumirlos via `SELECT * FROM fn(...)` desde Drizzle.
--   * Los SP de escritura usan PROCEDURE + bloque BEGIN/EXCEPTION/END para
--     atomicidad. `RAISE EXCEPTION` propaga errores de negocio a Drizzle/JS.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- sp_get_available_slots(p_date)
--
-- Devuelve los ScheduleEvents disponibles (availabilityStatus = 'available'
-- y eventType = 'appointment') para una fecha dada, ordenados por hora.
--
-- Uso: SELECT * FROM sp_get_available_slots('2026-05-10');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_available_slots(p_date DATE)
RETURNS TABLE (
  id          UUID,
  "eventDate" DATE,
  "startTime" TIME,
  "endTime"   TIME
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
    SELECT
      se.id,
      se."eventDate",
      se."startTime",
      se."endTime"
    FROM "ScheduleEvents" se
    WHERE se."eventDate"          = p_date
      AND se."eventType"          = 'appointment'
      AND se."availabilityStatus" = 'available'
    ORDER BY se."startTime" ASC;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_book_appointment(p_event_id, p_patient_dui, p_booking_reason, p_audit_user_id)
--
-- Reserva una cita sobre un slot existente y disponible. Pasos:
--   1. Valida que el evento existe, es de tipo 'appointment' y esta 'available'.
--   2. Registra quien realizo la reserva (auditUserId).
--   3. Inserta MedicalAppointments → trg_block_event_on_appointment cambia el
--      estado del evento a 'pending' automaticamente.
--
-- Uso: CALL sp_book_appointment('<event-uuid>', '01234567-8', 'Consulta general', '<user-uuid>');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_book_appointment(
  p_event_id       UUID,
  p_patient_dui    VARCHAR,
  p_booking_reason VARCHAR,
  p_audit_user_id  UUID
)
LANGUAGE plpgsql AS $$
DECLARE
  v_event_type        "event_type";
  v_availability      "availability_status";
BEGIN
  SELECT se."eventType", se."availabilityStatus"
    INTO v_event_type, v_availability
  FROM "ScheduleEvents" se
  WHERE se.id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot no encontrado: %', p_event_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_event_type <> 'appointment' THEN
    RAISE EXCEPTION 'El evento % no es un slot de cita', p_event_id
      USING ERRCODE = 'P0001';
  END IF;

  IF v_availability <> 'available' THEN
    RAISE EXCEPTION 'El slot % no esta disponible (estado actual: %)', p_event_id, v_availability
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE "ScheduleEvents"
    SET "auditUserId" = p_audit_user_id
  WHERE id = p_event_id;

  INSERT INTO "MedicalAppointments" (id, "eventId", "patientDui", "bookingReason", "bookedAt")
  VALUES (gen_random_uuid(), p_event_id, p_patient_dui, p_booking_reason, NOW());

EXCEPTION
  WHEN OTHERS THEN RAISE;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_cancel_appointment(p_appointment_id, p_cancelled_by)
--
-- Cancela una cita de forma transaccional. Pasos:
--   1. Resuelve el evento vinculado y valida que exista.
--   2. Verifica que el evento no este en estado 'completed'.
--   3. Registra quien cancelo (auditUserId).
--   4. Elimina la fila de MedicalAppointments → trg_free_event_on_appointment_cancel
--      devuelve el slot a 'available' automaticamente.
--
-- Uso: CALL sp_cancel_appointment('<appointment-uuid>', '<user-uuid>');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_cancel_appointment(
  p_appointment_id UUID,
  p_cancelled_by   UUID
)
LANGUAGE plpgsql AS $$
DECLARE
  v_event_id      UUID;
  v_event_status  "availability_status";
BEGIN
  SELECT ma."eventId", se."availabilityStatus"
    INTO v_event_id, v_event_status
  FROM "MedicalAppointments" ma
  JOIN "ScheduleEvents" se ON se.id = ma."eventId"
  WHERE ma.id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cita no encontrada: %', p_appointment_id
      USING ERRCODE = 'P0002';
  END IF;

  IF v_event_status = 'completed' THEN
    RAISE EXCEPTION 'La cita ya fue completada y no puede cancelarse'
      USING ERRCODE = 'P0001';
  END IF;

  UPDATE "ScheduleEvents"
    SET "auditUserId" = p_cancelled_by
  WHERE id = v_event_id;

  DELETE FROM "MedicalAppointments" WHERE id = p_appointment_id;

EXCEPTION
  WHEN OTHERS THEN RAISE;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_complete_consultation(p_appointment_id, p_symptoms, p_bp, p_weight,
--                          p_diagnosis, p_treatment, p_notes)
--
-- Cierra una consulta medica de forma atomica. Pasos:
--   1. Resuelve eventId y recordId via MedicalAppointments → Patients → MedicalRecords.
--   2. Inserta el registro clinico en ClinicalConsultations.
--   3. Marca el ScheduleEvent como 'completed'.
--
-- Uso: CALL sp_complete_consultation('<uuid>', 'sintomas', '120/80', 70.5,
--                                    'diagnostico', 'tratamiento', 'notas');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_complete_consultation(
  p_appointment_id UUID,
  p_symptoms       TEXT,
  p_bp             VARCHAR,
  p_weight         NUMERIC,
  p_diagnosis      TEXT,
  p_treatment      TEXT,
  p_notes          TEXT
)
LANGUAGE plpgsql AS $$
DECLARE
  v_event_id  UUID;
  v_record_id UUID;
BEGIN
  SELECT ma."eventId", mr.id
    INTO v_event_id, v_record_id
  FROM "MedicalAppointments" ma
  JOIN "Patients"       p  ON p.dui          = ma."patientDui"
  JOIN "MedicalRecords" mr ON mr."patientDui" = p.dui
  WHERE ma.id = p_appointment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cita o expediente medico no encontrado: %', p_appointment_id
      USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO "ClinicalConsultations" (
    id, "recordId", "appointmentId",
    "presentedSymptoms", "bloodPressure", "weightKg",
    "mainDiagnosis", "prescribedTreatment", "doctorPrivateNotes"
  ) VALUES (
    gen_random_uuid(), v_record_id, p_appointment_id,
    p_symptoms, p_bp, p_weight,
    p_diagnosis, p_treatment, p_notes
  );

  UPDATE "ScheduleEvents"
    SET "availabilityStatus" = 'completed'
  WHERE id = v_event_id;

EXCEPTION
  WHEN OTHERS THEN RAISE;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_get_patient_history(p_dui)
--
-- Retorna el historial completo del paciente: datos demograficos + expediente
-- + todas las consultas clinicas ordenadas por fecha descendente.
--
-- Uso: SELECT * FROM sp_get_patient_history('01234567-8');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_get_patient_history(p_dui VARCHAR)
RETURNS TABLE (
  "dui"                 VARCHAR(10),
  "firstName"           VARCHAR(100),
  "lastName"            VARCHAR(100),
  "birthDate"           DATE,
  "whatsappPhone"       VARCHAR(20),
  "insurerName"         VARCHAR(200),
  "coverageType"        VARCHAR(50),
  "recordId"            UUID,
  "bloodType"           VARCHAR(5),
  "knownAllergies"      TEXT,
  "familyHistory"       TEXT,
  "chronicConditions"   TEXT,
  "recordOpenedAt"      DATE,
  "consultationId"      UUID,
  "consultationDate"    TIMESTAMP WITH TIME ZONE,
  "appointmentId"       UUID,
  "presentedSymptoms"   TEXT,
  "bloodPressure"       VARCHAR(20),
  "weightKg"            NUMERIC(5,2),
  "mainDiagnosis"       TEXT,
  "prescribedTreatment" TEXT,
  "doctorPrivateNotes"  TEXT
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
    SELECT
      pfv."dui",
      pfv."firstName",
      pfv."lastName",
      pfv."birthDate",
      pfv."whatsappPhone",
      pfv."insurerName",
      pfv."coverageType",
      pfv."recordId",
      pfv."bloodType",
      pfv."knownAllergies",
      pfv."familyHistory",
      pfv."chronicConditions",
      pfv."recordOpenedAt",
      cc.id                AS "consultationId",
      ma."bookedAt"        AS "consultationDate",
      cc."appointmentId",
      cc."presentedSymptoms",
      cc."bloodPressure",
      cc."weightKg",
      cc."mainDiagnosis",
      cc."prescribedTreatment",
      cc."doctorPrivateNotes"
    FROM "PatientFullRecordView" pfv
    LEFT JOIN "ClinicalConsultations" cc ON cc."recordId"   = pfv."recordId"
    LEFT JOIN "MedicalAppointments"   ma ON ma.id           = cc."appointmentId"
    WHERE pfv."dui" = p_dui
    ORDER BY ma."bookedAt" DESC NULLS LAST;
END;
$$;


-- -----------------------------------------------------------------------------
-- sp_check_availability(p_date)
--
-- Retorna todos los slots disponibles para una fecha, incluyendo doctorId.
-- Complementa sp_get_available_slots cuando se necesita filtrar por medico.
--
-- Uso: SELECT * FROM sp_check_availability('2026-05-10');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_check_availability(p_date DATE)
RETURNS TABLE (
  event_id   UUID,
  doctor_id  UUID,
  event_date DATE,
  start_time TIME,
  end_time   TIME
)
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
    SELECT
      se.id,
      se."doctorId",
      se."eventDate",
      se."startTime",
      se."endTime"
    FROM "ScheduleEvents" se
    WHERE se."eventDate"          = p_date
      AND se."eventType"          = 'appointment'
      AND se."availabilityStatus" = 'available'
    ORDER BY se."startTime" ASC;
END;
$$;
