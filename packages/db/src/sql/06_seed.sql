-- ============================================================
-- SEED DATA — 25+ rows per table
-- ============================================================

-- MedicalInsurances (5 rows)
INSERT INTO "MedicalInsurances" (id, "insurerName", "coverageType") VALUES
  ('a1000000-0000-0000-0000-000000000001', 'SISA',         'comprehensive'),
  ('a1000000-0000-0000-0000-000000000002', 'ASESUISA',     'complete'),
  ('a1000000-0000-0000-0000-000000000003', 'Pan American', 'basic'),
  ('a1000000-0000-0000-0000-000000000004', 'ACSA',         'dental'),
  ('a1000000-0000-0000-0000-000000000005', 'La Central',   'vision');

-- Users (25 rows: 1 admin, 2 doctors, 2 receptionists, 20 patients)
INSERT INTO "Users" (id, email, "passwordHash", role, "accountStatus") VALUES
  ('b1000000-0000-0000-0000-000000000001', 'admin@clinic.com',         '$2b$10$hash_admin',  'admin',        'active'),
  ('b1000000-0000-0000-0000-000000000002', 'dra.garcia@clinic.com',    '$2b$10$hash_doc1',   'doctor',       'active'),
  ('b1000000-0000-0000-0000-000000000003', 'dr.martinez@clinic.com',   '$2b$10$hash_doc2',   'doctor',       'active'),
  ('b1000000-0000-0000-0000-000000000004', 'recep1@clinic.com',        '$2b$10$hash_rec1',   'receptionist', 'active'),
  ('b1000000-0000-0000-0000-000000000005', 'recep2@clinic.com',        '$2b$10$hash_rec2',   'receptionist', 'active'),
  ('b1000000-0000-0000-0000-000000000006', 'carlos.mejia@mail.com',    '$2b$10$hash_p1',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000007', 'ana.rivas@mail.com',       '$2b$10$hash_p2',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000008', 'jose.flores@mail.com',     '$2b$10$hash_p3',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000009', 'maria.lopez@mail.com',     '$2b$10$hash_p4',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000010', 'luis.hernandez@mail.com',  '$2b$10$hash_p5',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000011', 'sofia.perez@mail.com',     '$2b$10$hash_p6',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000012', 'pedro.ramirez@mail.com',   '$2b$10$hash_p7',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000013', 'laura.santos@mail.com',    '$2b$10$hash_p8',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000014', 'miguel.torres@mail.com',   '$2b$10$hash_p9',     'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000015', 'elena.vargas@mail.com',    '$2b$10$hash_p10',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000016', 'diego.morales@mail.com',   '$2b$10$hash_p11',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000017', 'isabella.cruz@mail.com',   '$2b$10$hash_p12',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000018', 'andres.jimenez@mail.com',  '$2b$10$hash_p13',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000019', 'valentina.ruiz@mail.com',  '$2b$10$hash_p14',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000020', 'roberto.diaz@mail.com',    '$2b$10$hash_p15',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000021', 'camila.reyes@mail.com',    '$2b$10$hash_p16',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000022', 'fernando.vega@mail.com',   '$2b$10$hash_p17',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000023', 'natalia.mora@mail.com',    '$2b$10$hash_p18',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000024', 'sebastian.arias@mail.com', '$2b$10$hash_p19',    'patient',      'active'),
  ('b1000000-0000-0000-0000-000000000025', 'daniela.silva@mail.com',   '$2b$10$hash_p20',    'patient',      'active');

-- Patients (20 rows — NOTE: triggers will auto-create MedicalRecords)
INSERT INTO "Patients" (dui, "userId", "firstName", "lastName", "whatsappPhone", "birthDate", "insuranceId") VALUES
  ('00000001-1', 'b1000000-0000-0000-0000-000000000006', 'Carlos',    'Mejia',      '+50370000001', '1990-03-12', 'a1000000-0000-0000-0000-000000000001'),
  ('00000002-2', 'b1000000-0000-0000-0000-000000000007', 'Ana',       'Rivas',      '+50370000002', '1985-07-24', 'a1000000-0000-0000-0000-000000000002'),
  ('00000003-3', 'b1000000-0000-0000-0000-000000000008', 'José',      'Flores',     '+50370000003', '1992-11-05', NULL),
  ('00000004-4', 'b1000000-0000-0000-0000-000000000009', 'María',     'López',      '+50370000004', '1978-01-30', 'a1000000-0000-0000-0000-000000000003'),
  ('00000005-5', 'b1000000-0000-0000-0000-000000000010', 'Luis',      'Hernández',  '+50370000005', '2000-06-18', 'a1000000-0000-0000-0000-000000000001'),
  ('00000006-6', 'b1000000-0000-0000-0000-000000000011', 'Sofía',     'Pérez',      '+50370000006', '1995-09-03', NULL),
  ('00000007-7', 'b1000000-0000-0000-0000-000000000012', 'Pedro',     'Ramírez',    '+50370000007', '1988-04-22', 'a1000000-0000-0000-0000-000000000004'),
  ('00000008-8', 'b1000000-0000-0000-0000-000000000013', 'Laura',     'Santos',     '+50370000008', '1973-12-09', 'a1000000-0000-0000-0000-000000000002'),
  ('00000009-9', 'b1000000-0000-0000-0000-000000000014', 'Miguel',    'Torres',     '+50370000009', '2001-02-14', NULL),
  ('00000010-0', 'b1000000-0000-0000-0000-000000000015', 'Elena',     'Vargas',     '+50370000010', '1983-08-27', 'a1000000-0000-0000-0000-000000000005'),
  ('00000011-1', 'b1000000-0000-0000-0000-000000000016', 'Diego',     'Morales',    '+50370000011', '1997-05-16', 'a1000000-0000-0000-0000-000000000001'),
  ('00000012-2', 'b1000000-0000-0000-0000-000000000017', 'Isabella',  'Cruz',       '+50370000012', '1991-10-31', NULL),
  ('00000013-3', 'b1000000-0000-0000-0000-000000000018', 'Andrés',    'Jiménez',    '+50370000013', '1969-03-07', 'a1000000-0000-0000-0000-000000000003'),
  ('00000014-4', 'b1000000-0000-0000-0000-000000000019', 'Valentina', 'Ruiz',       '+50370000014', '2003-07-19', 'a1000000-0000-0000-0000-000000000002'),
  ('00000015-5', 'b1000000-0000-0000-0000-000000000020', 'Roberto',   'Díaz',       '+50370000015', '1980-11-25', NULL),
  ('00000016-6', 'b1000000-0000-0000-0000-000000000021', 'Camila',    'Reyes',      '+50370000016', '1994-01-08', 'a1000000-0000-0000-0000-000000000004'),
  ('00000017-7', 'b1000000-0000-0000-0000-000000000022', 'Fernando',  'Vega',       '+50370000017', '1976-06-13', 'a1000000-0000-0000-0000-000000000001'),
  ('00000018-8', 'b1000000-0000-0000-0000-000000000023', 'Natalia',   'Mora',       '+50370000018', '1998-04-02', NULL),
  ('00000019-9', 'b1000000-0000-0000-0000-000000000024', 'Sebastián', 'Arias',      '+50370000019', '1986-09-20', 'a1000000-0000-0000-0000-000000000005'),
  ('00000020-0', 'b1000000-0000-0000-0000-000000000025', 'Daniela',   'Silva',      '+50370000020', '2002-12-11', 'a1000000-0000-0000-0000-000000000002');

-- Update blood types on auto-created MedicalRecords
UPDATE "MedicalRecords" SET "bloodType" = 'O+'  WHERE "patientDui" IN ('00000001-1','00000005-5','00000009-9','00000013-3','00000017-7');
UPDATE "MedicalRecords" SET "bloodType" = 'A+'  WHERE "patientDui" IN ('00000002-2','00000006-6','00000010-0','00000014-4','00000018-8');
UPDATE "MedicalRecords" SET "bloodType" = 'B+'  WHERE "patientDui" IN ('00000003-3','00000007-7','00000011-1','00000015-5','00000019-9');
UPDATE "MedicalRecords" SET "bloodType" = 'AB+' WHERE "patientDui" IN ('00000004-4','00000008-8','00000012-2','00000016-6','00000020-0');

UPDATE "MedicalRecords" SET
  "knownAllergies"    = 'Penicillin',
  "familyHistory"     = 'Diabetes, Hypertension',
  "chronicConditions" = 'Type 2 Diabetes'
WHERE "patientDui" = '00000001-1';

UPDATE "MedicalRecords" SET
  "knownAllergies"    = 'Ibuprofen',
  "familyHistory"     = 'Heart disease',
  "chronicConditions" = 'Hypertension'
WHERE "patientDui" = '00000004-4';

-- ScheduleEvents (25 rows)
INSERT INTO "ScheduleEvents" (id, "eventDate", "startTime", "endTime", "eventType", "availabilityStatus", "syncStatus", "auditUserId") VALUES
  ('c1000000-0000-0000-0000-000000000001', '2026-05-05', '08:00', '08:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000002', '2026-05-05', '08:30', '09:00', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000003', '2026-05-05', '09:00', '09:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000004', '2026-05-05', '09:30', '10:00', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000005', '2026-05-05', '10:00', '10:30', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000006', '2026-05-06', '08:00', '08:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000007', '2026-05-06', '08:30', '09:00', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000008', '2026-05-06', '09:00', '09:30', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000009', '2026-05-06', '09:30', '10:00', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000010', '2026-05-07', '08:00', '08:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000011', '2026-05-07', '08:30', '09:00', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000012', '2026-05-07', '09:00', '09:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000013', '2026-05-08', '08:00', '08:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000014', '2026-05-08', '08:30', '09:00', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000015', '2026-05-08', '09:00', '09:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000016', '2026-05-09', '08:00', '08:30', 'appointment', 'busy',      'synced',  'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000017', '2026-05-09', '08:30', '09:00', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000018', '2026-05-09', '09:00', '09:30', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000019', '2026-05-12', '08:00', '08:30', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000020', '2026-05-12', '08:30', '09:00', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000021', '2026-05-12', '09:00', '09:30', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000022', '2026-05-13', '08:00', '08:30', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000023', '2026-05-13', '08:30', '09:00', 'appointment', 'available', 'pending', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000024', '2026-05-14', '08:00', '09:00', 'vacation',    'blocked',   'synced',  'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000025', '2026-05-15', '08:00', '09:00', 'block',       'blocked',   'synced',  'b1000000-0000-0000-0000-000000000002');

-- MedicalAppointments (15 rows — triggers fire WhatsApp + block event)
INSERT INTO "MedicalAppointments" (id, "eventId", "patientDui", "bookingReason") VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', '00000001-1', 'General checkup'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', '00000002-2', 'Blood pressure control'),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', '00000003-3', 'Acute fever'),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000006', '00000004-4', 'Diabetes follow-up'),
  ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000007', '00000005-5', 'Routine blood work'),
  ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000010', '00000006-6', 'Back pain'),
  ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000011', '00000007-7', 'Post-surgery follow-up'),
  ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000012', '00000008-8', 'Cholesterol check'),
  ('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000013', '00000009-9', 'Headache and dizziness'),
  ('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000014', '00000010-0', 'Annual physical'),
  ('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000015', '00000011-1', 'Allergy consultation'),
  ('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000016', '00000012-2', 'Skin rash'),
  ('d1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000001', '00000013-3', 'Knee pain'),
  ('d1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000002', '00000014-4', 'Vaccination'),
  ('d1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000003', '00000015-5', 'Hypertension control');

-- ClinicalConsultations (use sp_register_consultation for real usage; direct insert for seed)
INSERT INTO "ClinicalConsultations" (id, "recordId", "appointmentId", "presentedSymptoms", "bloodPressure", "weightKg", "mainDiagnosis", "prescribedTreatment", "doctorPrivateNotes")
SELECT
  gen_random_uuid(),
  mr.id,
  d.id,
  symptom,
  bp,
  weight,
  diag,
  treat,
  notes
FROM (VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Fatigue, frequent urination',    '120/80', 72.5, 'Type 2 Diabetes',      'Metformin 500mg twice daily',         'Monitor HbA1c in 3 months'),
  ('d1000000-0000-0000-0000-000000000002', 'High BP reading at home',        '150/95', 68.0, 'Hypertension Stage 1', 'Losartan 50mg once daily',            'Reduce sodium intake'),
  ('d1000000-0000-0000-0000-000000000003', 'Fever 38.5°C, sore throat',      '118/76', 65.0, 'Acute pharyngitis',    'Amoxicillin 500mg 3x daily 7 days',   NULL),
  ('d1000000-0000-0000-0000-000000000004', 'Fasting glucose 180mg/dl',       '130/85', 88.0, 'Uncontrolled diabetes','Increase Metformin to 1000mg',        'Refer to nutritionist'),
  ('d1000000-0000-0000-0000-000000000005', 'Routine, no complaints',         '115/75', 70.0, 'Healthy patient',      'Continue healthy lifestyle',           NULL),
  ('d1000000-0000-0000-0000-000000000006', 'Lower back pain radiating leg',  '122/80', 90.0, 'Lumbar disc herniation','Ibuprofen 400mg + physiotherapy',    'MRI recommended'),
  ('d1000000-0000-0000-0000-000000000007', 'Wound healing well',             '118/78', 75.0, 'Post-op recovery',     'Continue wound care protocol',        'Next visit in 2 weeks'),
  ('d1000000-0000-0000-0000-000000000008', 'LDL 210 mg/dl',                  '125/82', 83.0, 'Hypercholesterolemia', 'Atorvastatin 20mg at night',          'Reduce saturated fats'),
  ('d1000000-0000-0000-0000-000000000009', 'Headache 3 days, vertigo',       '130/88', 60.0, 'Migraine with aura',   'Sumatriptan 50mg as needed',          'Consider neurology referral'),
  ('d1000000-0000-0000-0000-000000000010', 'Annual physical, no issues',     '119/79', 67.0, 'Healthy patient',      'Vitamin D supplement',                NULL),
  ('d1000000-0000-0000-0000-000000000011', 'Seasonal allergy, runny nose',   '117/76', 55.0, 'Allergic rhinitis',    'Loratadine 10mg daily',               NULL),
  ('d1000000-0000-0000-0000-000000000012', 'Red itchy rash on arms',         '120/78', 62.0, 'Contact dermatitis',   'Hydrocortisone cream 1%',             'Patch test recommended'),
  ('d1000000-0000-0000-0000-000000000013', 'Left knee pain 2 weeks',         '128/84', 95.0, 'Osteoarthritis',       'Naproxen 250mg + knee brace',         'X-ray ordered'),
  ('d1000000-0000-0000-0000-000000000014', 'Vaccination visit',              '116/74', 58.0, 'Influenza vaccination', 'Flu vaccine administered',            NULL),
  ('d1000000-0000-0000-0000-000000000015', 'BP 160/100 at home last week',   '158/102',78.0, 'Hypertension Stage 2', 'Amlodipine 5mg + Losartan 50mg',      'Urgent BP monitoring daily')
) AS t(appt_id, symptom, bp, weight, diag, treat, notes)
JOIN "MedicalAppointments" d  ON d.id = appt_id::uuid
JOIN "MedicalRecords"      mr ON mr."patientDui" = d."patientDui";
