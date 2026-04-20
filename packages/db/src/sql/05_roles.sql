-- ============================================================
-- ROLES & PRIVILEGES
-- ============================================================

-- Create roles
CREATE ROLE role_admin       LOGIN PASSWORD 'Admin@2026!';
CREATE ROLE role_doctor      LOGIN PASSWORD 'Doctor@2026!';
CREATE ROLE role_receptionist LOGIN PASSWORD 'Recept@2026!';
CREATE ROLE role_patient     LOGIN PASSWORD 'Patient@2026!';

-- ---- ADMIN: full access ----
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO role_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO role_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO role_admin;

-- ---- DOCTOR: read all clinical data, write consultations ----
GRANT SELECT ON
  "Users", "Patients", "MedicalInsurances",
  "MedicalRecords", "ScheduleEvents", "MedicalAppointments",
  "WhatsAppMessages"
TO role_doctor;

GRANT SELECT, INSERT, UPDATE ON
  "ClinicalConsultations"
TO role_doctor;

GRANT SELECT ON
  "DailyScheduleView", "PatientFullRecordView"
TO role_doctor;

-- ---- RECEPTIONIST: manage schedule and appointments ----
GRANT SELECT ON
  "Users", "Patients", "MedicalInsurances", "ScheduleEvents",
  "MedicalAppointments", "WhatsAppMessages"
TO role_receptionist;

GRANT INSERT, UPDATE, DELETE ON
  "ScheduleEvents", "MedicalAppointments"
TO role_receptionist;

GRANT INSERT ON
  "WhatsAppMessages"
TO role_receptionist;

GRANT SELECT ON
  "DailyScheduleView"
TO role_receptionist;

-- ---- PATIENT: read only their own appointments ----
-- (row-level security should be added in production)
GRANT SELECT ON
  "MedicalAppointments", "ScheduleEvents"
TO role_patient;
