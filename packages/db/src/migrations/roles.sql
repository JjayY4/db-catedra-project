-- =============================================================================
-- Roles de base de datos — Principio de minimo privilegio
-- Sistema de Citas Medicas
--
-- Roles:
--   rol_paciente   : puede ver slots disponibles y reservar citas
--   rol_secretaria : gestiona pacientes y agenda (sin acceso a datos clinicos)
--   rol_doctora    : acceso completo a tablas clinicas + operaciones admin
-- =============================================================================

CREATE ROLE rol_paciente;
CREATE ROLE rol_secretaria;
CREATE ROLE rol_doctora;

-- -----------------------------------------------------------------------------
-- rol_paciente
-- -----------------------------------------------------------------------------
GRANT SELECT ON "ScheduleEvents" TO rol_paciente;
GRANT SELECT ON "MedicalInsurances" TO rol_paciente;
GRANT INSERT ON "MedicalAppointments" TO rol_paciente;
GRANT SELECT ON "MedicalAppointments" TO rol_paciente;
GRANT SELECT, UPDATE ON "Patients" TO rol_paciente;

-- -----------------------------------------------------------------------------
-- rol_secretaria
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON "Patients" TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ScheduleEvents" TO rol_secretaria;
GRANT SELECT, INSERT, UPDATE ON "MedicalAppointments" TO rol_secretaria;
GRANT SELECT ON "MedicalInsurances" TO rol_secretaria;
GRANT SELECT ON "MedicalRecords" TO rol_secretaria;
-- Sin acceso a ClinicalConsultations (contiene datos medicos privados)
-- Sin acceso a doctorPrivateNotes (aplicado en la capa de aplicacion)

-- -----------------------------------------------------------------------------
-- rol_doctora
-- -----------------------------------------------------------------------------
GRANT ALL PRIVILEGES ON "Patients" TO rol_doctora;
GRANT ALL PRIVILEGES ON "ScheduleEvents" TO rol_doctora;
GRANT ALL PRIVILEGES ON "MedicalAppointments" TO rol_doctora;
GRANT ALL PRIVILEGES ON "MedicalRecords" TO rol_doctora;
GRANT ALL PRIVILEGES ON "ClinicalConsultations" TO rol_doctora;
GRANT ALL PRIVILEGES ON "MedicalInsurances" TO rol_doctora;
GRANT SELECT, UPDATE ON "Users" TO rol_doctora;
-- Acceso de lectura a todas las tablas del esquema publico
GRANT SELECT ON ALL TABLES IN SCHEMA public TO rol_doctora;
