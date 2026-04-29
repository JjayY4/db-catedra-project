-- 0002_roles_postgresql.sql
-- Standalone migration (fuera de la numeración drizzle-kit).
-- Define cuatro roles PostgreSQL con privilegios diferenciados y RLS para "ScheduleEvents".
-- Aplicar con: psql $DATABASE_URL -f packages/db/src/migrations/sql/0002_roles_postgresql.sql

-- ============================================================
-- 1. Crear roles con login (passwords son placeholders — rotar en entorno real)
-- ============================================================
CREATE ROLE rol_paciente   WITH LOGIN PASSWORD 'CHANGE_ME_paciente';
CREATE ROLE rol_secretaria WITH LOGIN PASSWORD 'CHANGE_ME_secretaria';
CREATE ROLE rol_doctora    WITH LOGIN PASSWORD 'CHANGE_ME_doctora';
CREATE ROLE rol_admin      WITH LOGIN PASSWORD 'CHANGE_ME_admin';

-- Permitir USAGE en el schema public a los cuatro roles
GRANT USAGE ON SCHEMA public TO rol_paciente, rol_secretaria, rol_doctora, rol_admin;

-- ============================================================
-- 2. rol_paciente
--    - SELECT sobre "ScheduleEvents" (filtrado por RLS)
--    - INSERT sobre "MedicalAppointments" (solicitar cita)
-- ============================================================
GRANT SELECT ON TABLE "ScheduleEvents"      TO rol_paciente;
GRANT INSERT ON TABLE "MedicalAppointments" TO rol_paciente;

-- ============================================================
-- 3. rol_secretaria
--    - SELECT/INSERT/UPDATE: Patients, ScheduleEvents, MedicalAppointments, WhatsAppMessages
--    - SELECT: Users, MedicalInsurances
--    - SELECT por columnas sobre ClinicalConsultations (excluyendo doctorPrivateNotes)
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON TABLE "Patients"            TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON TABLE "ScheduleEvents"      TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON TABLE "MedicalAppointments" TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON TABLE "WhatsAppMessages"    TO rol_secretaria;

GRANT SELECT ON TABLE "Users"             TO rol_secretaria;
GRANT SELECT ON TABLE "MedicalInsurances" TO rol_secretaria;

-- Column-level grant: PostgreSQL no permite DENY, así que se otorga SELECT
-- únicamente sobre las columnas no sensibles, omitiendo "doctorPrivateNotes".
GRANT SELECT (
  "id",
  "recordId",
  "appointmentId",
  "presentedSymptoms",
  "bloodPressure",
  "weightKg",
  "mainDiagnosis",
  "prescribedTreatment"
) ON TABLE "ClinicalConsultations" TO rol_secretaria;

-- ============================================================
-- 4. rol_doctora
--    - CRUD completo: MedicalRecords, ClinicalConsultations (incluye doctorPrivateNotes), ScheduleEvents
--    - SELECT: Patients, MedicalInsurances
--    - Sin acceso a Users/Sessions/Accounts
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "MedicalRecords"        TO rol_doctora;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ClinicalConsultations" TO rol_doctora;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "ScheduleEvents"        TO rol_doctora;

GRANT SELECT ON TABLE "Patients"          TO rol_doctora;
GRANT SELECT ON TABLE "MedicalInsurances" TO rol_doctora;

-- ============================================================
-- 5. rol_admin
--    - ALL PRIVILEGES sobre todas las tablas existentes y futuras
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO rol_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rol_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO rol_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO rol_admin;

-- ============================================================
-- 6. Row Level Security para "ScheduleEvents"
--    - Habilita RLS y crea política basada en app.current_user_id
--    - La aplicación debe ejecutar `SET LOCAL app.current_user_id = '<uuid>'`
--      antes de las queries que corren como rol_paciente.
-- ============================================================
ALTER TABLE "ScheduleEvents" ENABLE ROW LEVEL SECURITY;

-- rol_admin/rol_doctora/rol_secretaria deben ver todas las filas:
ALTER TABLE "ScheduleEvents" FORCE ROW LEVEL SECURITY;

CREATE POLICY schedule_events_admin_all ON "ScheduleEvents"
  FOR ALL
  TO rol_admin, rol_doctora, rol_secretaria
  USING (true)
  WITH CHECK (true);

-- rol_paciente: solo eventos asociados a citas suyas (auditUserId es el usuario que creó/posee el evento).
-- La política se evalúa con el UUID inyectado por la app vía `SET LOCAL app.current_user_id`.
CREATE POLICY schedule_events_paciente_select ON "ScheduleEvents"
  FOR SELECT
  TO rol_paciente
  USING (
    "auditUserId" = current_setting('app.current_user_id', true)::uuid
  );
