# @repo/db

PostgreSQL database package. Contains the Drizzle ORM schema, views, triggers, stored procedures, and query helpers for the medical appointments system.

---

## Schema Overview

| Table | Description |
|-------|-------------|
| `Users` | All users of the system (doctors, receptionists, patients) |
| `Accounts` | OAuth / provider-linked accounts (Better Auth) |
| `Sessions` | Active session tokens |
| `Verifications` | Email verification tokens |
| `Patients` | Patient profile: DUI (PK), insurance, contact info |
| `MedicalInsurances` | Insurance providers and coverage types |
| `MedicalRecords` | One medical record per patient: blood type, allergies, history |
| `MedicalAppointments` | Appointment bookings linked to a `ScheduleEvent` |
| `ClinicalConsultations` | Clinical data recorded during a consultation |
| `ScheduleEvents` | Doctor calendar slots (available / pending / busy / blocked / completed / cancelled) |

---

## Views

### `DailyScheduleView`

**Files:** `src/sql/01_views.sql` · `src/schema/views.ts`

Joins `ScheduleEvents` + `MedicalAppointments` + `Patients`. Only includes rows where `eventType = 'appointment'`.

**Columns:** `eventId`, `doctorId`, `eventDate`, `startTime`, `endTime`, `availabilityStatus`, `appointmentId`, `bookingReason`, `patientDui`, `firstName`, `lastName`, `whatsappPhone`

**Consumed by:**
- `apps/api/src/modules/doctor-agenda/infrastructure/repositories/drizzle-doctor-agenda.repository.ts:4` — queried at lines 61–78 for `GET /doctor-agenda`
- `apps/api/src/modules/receptionist-agenda/infrastructure/repositories/drizzle-receptionist-agenda.repository.ts:4` — queried at lines 34–41 for `GET /agenda`

---

### `PatientFullRecordView`

**Files:** `src/sql/01_views.sql` · `src/schema/views.ts`

Joins `Patients` + `MedicalInsurances` + `MedicalRecords` + the latest `ClinicalConsultation` (via LATERAL JOIN).

**Columns:** `dui`, `firstName`, `lastName`, `birthDate`, `whatsappPhone`, `insurerName`, `coverageType`, `recordId`, `bloodType`, `knownAllergies`, `familyHistory`, `chronicConditions`, `recordOpenedAt`, `lastConsultationId`, `lastDiagnosis`, `lastTreatment`, `lastVisitDate`

**Consumed by:**
- `apps/api/src/modules/patients/application/usecases/get-patient-profile.usecase.ts:8` — queried for `GET /patients/:dui/profile`

---

## Triggers

All trigger functions are applied at runtime via `applyTriggers(db)` from `src/schema/triggers.ts`. The raw DDL lives in `src/sql/02_triggers.sql`.

### `trg_create_medical_record`

**Files:** `src/sql/02_triggers.sql` · `src/schema/triggers.ts`

**Event:** `AFTER INSERT ON "Patients"`

**What it does:** Automatically creates an empty `MedicalRecords` row for the new patient (`bloodType = NULL`, `openedAt = CURRENT_DATE`). Ensures every patient always has a medical record without requiring the application layer to do a second insert.

**Fired by:**
- `apps/api/src/modules/patients/infrastructure/repositories/drizzle-patients.repository.ts:70` — `tx.insert(Patients)` in the `create` method

---

### `trg_block_event_on_appointment`

**Files:** `src/sql/02_triggers.sql` · `src/schema/triggers.ts`

**Event:** `AFTER INSERT ON "MedicalAppointments"`

**What it does:** Sets `ScheduleEvents.availabilityStatus = 'pending'` for the slot linked to the new appointment. Prevents double-booking without needing an explicit UPDATE in the booking procedure.

**Fired by:**
- `apps/api/src/modules/appointments/infrastructure/repositories/drizzle-appointments.repository.ts:67` — `tx.insert(MedicalAppointments)` in the `book` method

---

### `trg_free_event_on_appointment_cancel`

**Files:** `src/sql/02_triggers.sql` · `src/schema/triggers.ts`

**Event:** `AFTER DELETE ON "MedicalAppointments"`

**What it does:** Sets `ScheduleEvents.availabilityStatus = 'available'` for the slot that was freed by the cancellation. The slot becomes bookable again without requiring the application layer to issue an explicit UPDATE.

**Fired by:**
- `apps/api/src/modules/appointments/application/usecases/cancel-appointment.usecase.ts:23` — `tx.execute(sql\`CALL sp_cancel_appointment(...)\`)` deletes the row

---

## Stored Procedures

Canonical SQL: `src/stored-procedures.sql` (lab copy: `src/sql/03_stored_procedures.sql`)
TypeScript wrappers: `src/queries/stored-procedures.ts`
Exported via: `src/queries/index.ts`

### `sp_get_available_slots(p_date DATE)` → FUNCTION

**TypeScript:** `getAvailableSlots(date: string): Promise<AvailableSlot[]>`

Returns all `ScheduleEvents` with `availabilityStatus = 'available'` and `eventType = 'appointment'` for the given date, ordered by `startTime`.

**Consumed by:**
- `apps/api/src/modules/receptionist-schedule/application/usecases/get-slots-by-date.usecase.ts:7` — called for `GET /schedule-events/slots?date=`

---

### `sp_book_appointment(p_event_id, p_patient_dui, p_booking_reason, p_audit_user_id)` → PROCEDURE

**TypeScript:** `bookAppointment(eventId, patientDui, bookingReason, auditUserId): Promise<void>`

Validates the target slot is `available` and `eventType = 'appointment'`, records `auditUserId`, then inserts a `MedicalAppointments` row. The `trg_block_event_on_appointment` trigger automatically sets the slot to `'pending'`.

Raises an exception if the slot is not found, not an appointment type, or not available.

**Consumed by:**
- `apps/api/src/modules/appointments/infrastructure/repositories/drizzle-appointments.repository.ts:67` — equivalent `tx.insert(MedicalAppointments)` in the `book` method (same effect; trigger fires either way)

---

### `sp_cancel_appointment(p_appointment_id, p_cancelled_by)` → PROCEDURE

**TypeScript:** `cancelAppointment(appointmentId, cancelledBy): Promise<void>`

Records `auditUserId` on the event, then deletes the `MedicalAppointments` row. The `trg_free_event_on_appointment_cancel` trigger automatically sets the slot back to `'available'`.

Raises an exception if the appointment is not found or if the slot is already `'completed'`.

**Consumed by:**
- `apps/api/src/modules/appointments/application/usecases/cancel-appointment.usecase.ts:23` — `tx.execute(sql\`CALL sp_cancel_appointment(...)\`)` for `DELETE /appointments/:id`

---

### `sp_complete_consultation(p_appointment_id, p_symptoms, p_bp, p_weight, p_diagnosis, p_treatment, p_notes)` → PROCEDURE

**TypeScript:** `completeConsultation(appointmentId, symptoms, bloodPressure, weightKg, diagnosis, treatment, privateNotes): Promise<void>`

Resolves the `MedicalRecord` via the chain `MedicalAppointments → Patients → MedicalRecords`, inserts a `ClinicalConsultations` row, and marks the `ScheduleEvent` as `'completed'`.

Raises an exception if the appointment or medical record is not found.

**Consumed by:**
- `apps/api/src/modules/medical-records/application/usecases/complete-consultation.usecase.ts:27` — `tx.execute(sql\`CALL sp_complete_consultation(...)\`)` for `POST /medical-records/:appointmentId/consultation`

---

### `sp_get_patient_history(p_dui VARCHAR)` → FUNCTION

**TypeScript:** `getPatientHistory(dui: string): Promise<PatientHistoryRow[]>`

Returns one row per `ClinicalConsultation` for the patient, ordered by consultation date descending. Demographics and medical record data are repeated on each row (denormalized for easy consumption).

**Consumed by:**
- `apps/api/src/modules/medical-records/application/usecases/get-patient-history-by-dui.usecase.ts:7` — called for `GET /medical-records/patient-history/:dui`

---

### `sp_check_availability(p_date DATE)` → FUNCTION

**TypeScript:** `checkAvailability(date: string): Promise<AvailabilitySlot[]>`

Like `sp_get_available_slots` but also returns `doctorId`, useful for filtering by doctor or building a multi-doctor schedule view.

**Consumed by:**
- `apps/api/src/modules/receptionist-schedule/application/usecases/check-availability.usecase.ts:7` — called for `GET /schedule-events/check-availability?date=`

---

## Subqueries

SQL: `src/sql/04_subqueries.sql`
TypeScript: `src/queries/subqueries.ts`
Exported via: `src/queries/index.ts`

### `getFrequentPatients`

Returns patients with more than 2 consultations in the current month, ordered by visit count descending.

**Consumed by:**
- `apps/api/src/modules/reports/application/usecases/get-frequent-patients.usecase.ts:5` — called for `GET /reports/frequent-patients`

---

### `getWeeklyAvailability`

Returns available slot counts grouped by day for the next 7 days.

**Consumed by:**
- `apps/api/src/modules/reports/application/usecases/get-weekly-availability.usecase.ts:5` — called for `GET /reports/weekly-availability`

---

### `findAppointmentsWithoutConsultation`

Returns appointments that have no `ClinicalConsultations` record yet (NOT EXISTS subquery).

**Consumed by:**
- `apps/api/src/modules/reports/application/usecases/get-pending-consultations.usecase.ts:5` — called for `GET /reports/pending-consultations`

---

### `getCancelledAppointmentsPerDoctor`

Returns the count of cancelled appointments per doctor for the current month, ordered descending.

**Consumed by:**
- `apps/api/src/modules/reports/application/usecases/get-cancelled-per-doctor.usecase.ts:5` — called for `GET /reports/cancelled-per-doctor`

---

## Running the SQL

Execute files in this order against a fresh database:

```bash
# 1. Views
psql $DATABASE_URL -f packages/db/src/sql/01_views.sql

# 2. Triggers
psql $DATABASE_URL -f packages/db/src/sql/02_triggers.sql

# 3. Stored procedures
psql $DATABASE_URL -f packages/db/src/stored-procedures.sql

# 4. Seed data (insurance providers + initial users)
psql $DATABASE_URL -f packages/db/src/sql/06_seed.sql
```

Roles (`src/sql/05_roles.sql`) and subqueries (`src/sql/04_subqueries.sql`) are standalone and do not need to be applied in order.

To apply triggers programmatically via Drizzle:

```ts
import { db } from '@repo/db/client'
import { applyTriggers } from '@repo/db/schema/triggers'

await applyTriggers(db)
```
