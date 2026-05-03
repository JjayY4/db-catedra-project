# Gap Analysis — `plan-product/specs/` vs. Codebase

Scan date: 2026-05-03. Sources: `plan-product/specs/{portal-paciente,vista-doctora,panel-secretaria,capa-datos}/*.md`, `apps/api/src/modules/*`, `apps/web/src/app/**`, `packages/db/src/{schema,migrations,queries,sql}`.

> **Out of scope (dropped):** Google Calendar sync, WhatsApp real API, cron reminders — no implementation needed.

---

## A. CRÍTICOS — bloquean criterios del rubric o flujos core

### A1. Limpiar referencias `'admin'` residuales
- **Decisión**: rol `admin` eliminado. La doctora actúa como admin con rol `doctor`.
- **Pendiente**: `seed-auth.ts`, `receptionist-schedule.routes.ts:19,29`, `receptionist-agenda.routes.ts:14`, `UserRole` TS enum (quitar `Admin = 'admin'`). `roles: ['receptionist','admin']` no coincide con ningún rol real → acceso denegado silencioso.
- Actualizar specs: `vista-doctora/gestion-usuarios-seguros.spec.md` y `capa-datos/roles-postgresql.spec.md` a 3 roles.

### A2. `MedicalRecords.bloodType` trigger inserta `'O+'` en vez de `NULL`
- **Estado**: sigue roto en `main`.
  - `packages/db/src/schema/triggers.ts:18` — `'O+'` hardcodeado.
  - `packages/db/src/sql/02_triggers.sql:10` — mismo valor.
- **Acción**: cambiar `'O+'` → `NULL` en ambos archivos + migración.

### A3. ~~`Patients.userId` nullable~~ — RESUELTO
- Confirmado: `patients.schema.ts` define `userId` sin `.notNull()` → ya nullable. No acción.

### A4. PostgreSQL roles (`rol_paciente`, `rol_secretaria`, `rol_doctora`) NO implementados
- **Spec** (`roles-postgresql.spec.md`): script SQL en `db/migrations/` con `CREATE ROLE` + `GRANT` columna por columna.
- **3 roles** (sin `rol_admin`): `rol_doctora` cubre operaciones administrativas.
- **Código**: grep `CREATE ROLE` → 0 resultados. No existe ningún archivo de roles.
- **Impacto**: criterio 7 del rubric directamente.
- **Acción**: crear `packages/db/src/migrations/roles.sql` con los 3 roles + grants.

### A5. Stored procedure `sp_get_available_slots` faltante
- **Spec** (`procedimientos-almacenados.spec.md`): cuatro SPs — disponibilidad, cancelación, cierre de consulta, historial.
- **Código** (`packages/db/src/stored-procedures.sql`): solo `sp_cancel_appointment`, `sp_complete_consultation`, `sp_get_patient_history`. **Falta `sp_get_available_slots(p_date)`**.

### A6. Endpoint `PATCH /appointments/:id/cancel` NO existe
- **Spec** (`panel-secretaria/cancelar-reagendar.spec.md`): llama `sp_cancel_appointment`; registra auditor; previene cancelar consultas ya completadas.
- **Código** (`appointments.routes.ts`): solo `POST /appointments` y `GET /appointments/my`. No hay `CancelAppointmentUseCase`.
- **Impacto**: la secretaria no puede cancelar — función central del panel.

### A7. Endpoint `CompleteConsultation` NO existe
- **Spec** (`vista-doctora/expediente-consulta.spec.md`): `sp_complete_consultation` se invoca al guardar el formulario clínico — escribe `ClinicalConsultations` y cambia `availabilityStatus` a `completed`.
- **Código** (`medical-records.routes.ts`): solo `GET /:id/history`. No hay POST/use case `CompleteConsultationUseCase`.
- **Impacto**: la doctora no puede registrar la consulta.

### A8. Registrar paciente desde la secretaria NO existe
- **Spec** (`panel-secretaria/registrar-paciente.spec.md`): formulario con DUI + WhatsApp; valida duplicado por DUI; permite vinculación posterior cuando el paciente crea cuenta web.
- **Código**: `patients.routes.ts` no tiene endpoint para que `receptionist` cree paciente sin `userId`.

---

## B. IMPORTANTES — features parciales o sin UI

### B1. CRUD de aseguradoras (`MedicalInsurances`) sólo lectura
- **Spec** (`vista-doctora/gestion-usuarios-seguros.spec.md`): agregar / editar / eliminar aseguradoras, con confirmación de impacto sobre pacientes.
- **Código**: módulo `medical-insurances` no existe. Solo `ListInsurancesUseCase` integrado en `patients`. Faltan módulo + `Create/Update/Delete` use cases + rutas.

### B2. Guard "no eliminar la propia cuenta" faltante
- **Spec**: el sistema debe impedir que la doctora-admin se elimine a sí misma.
- **Código** (`deactivate-user.usecase.ts`): no hay verificación de que `id !== currentUserId`. La ruta exige rol `doctor` pero el use case no valida propiedad.

### B3. Cancelación desde el Portal del Paciente — confirmar alcance
- **Spec** (`mis-citas.spec.md`): vista es read-only; el portal no define auto-cancelación explícita.
- **Decisión pendiente**: ¿el paciente puede cancelar sus propias citas? Si no, documentar como fuera de alcance.

### B7. Reagendar como flujo guiado (depende de A6)
- **Spec**: post-cancelación ofrecer ir directamente a elegir nuevo slot para el mismo paciente.
- **Código**: depende de A6; la UI no existe.

### B8. Bloquear horarios — validar overlap con appointments activas
- **Spec** (`panel-secretaria/bloquear-horarios.spec.md`): validar que el rango no tenga citas activas antes de crear el bloque.
- **Código**: `CreateBlockUseCase` existe. Verificar que aplique la validación de overlap con `MedicalAppointments`.

### B9. Configurar horarios — overlap con appointments y bloques
- **Spec** (`vista-doctora/configurar-horarios.spec.md`): rechaza solo los conflictivos, retorna `{ created, skipped }`.
- **Código** (`generate-weekly-schedule.usecase.ts`): ya devuelve `{ created, skipped }` — OK. Verificar que `findOverlappingKeys` detecte conflictos con appointments y bloques, no solo con slots existentes.

---

## C. FRONTEND — páginas faltantes o incompletas

Páginas confirmadas en `apps/web/src/app/`:

| Ruta | Estado |
|---|---|
| `(auth)/login` | ✅ existe |
| `(auth)/register` | ✅ existe |
| `verify-email` | ✅ existe |
| `complete-profile` | ✅ existe |
| `(dashboard)/disponibilidad` | ✅ existe |
| `(dashboard)/reservar/[eventId]` | ✅ existe |
| `(dashboard)/mis-citas` | ✅ existe |
| `(dashboard)/agenda` | ✅ existe |
| `(dashboard)/dashboard/doctor/agenda` | ✅ existe |
| `(dashboard)/dashboard/doctor/horarios` | ✅ existe |
| `(dashboard)/dashboard/doctor/usuarios` | ✅ existe |
| `(dashboard)/dashboard/doctor/medical-records` | ✅ existe |
| `(dashboard)/dashboard/doctor/medical-records/[recordId]/history` | ✅ existe |
| `(dashboard)/dashboard/patient` | ✅ existe |
| `(dashboard)/dashboard/receptionist` | ✅ existe |

**Faltantes:**

- **C1.** `dashboard/doctor/expediente/[appointmentId]` — formulario de consulta clínica (síntomas, PA, peso, diagnóstico, tratamiento, notas privadas). Bloqueada por A7.
- **C3.** `dashboard/receptionist/register-patient` — formulario rápido: DUI, nombre, WhatsApp, aseguradora. Bloqueada por A8.
- **C4.** Botón/modal cancelar en agenda de secretaria (`dashboard/receptionist` o `/agenda`). Bloqueada por A6.
- **C5.** Sección aseguradoras en `dashboard/doctor/usuarios` — tabla + CRUD modal. Bloqueada por B1.

---

## D. CONSISTENCIA — verificar

- **D1.** `auditUserId` en `ScheduleEvents`: verificar que `book-appointment` lo registre cuando aplique.
- **D2.** ~~`MedicalAppointments.eventId` UNIQUE~~ — RESUELTO: `unique()` confirmado en `medical-appointments.schema.ts`.
- **D3.** ~~Subconsultas~~ — RESUELTO: `subqueries.ts` tiene las 3 técnicas (correlacionada en WHERE, derivada en FROM, NOT EXISTS).
- **D4.** Seed: solo ~7 past events → <25 `ClinicalConsultations`. El rubric exige ≥25 por tabla. Expandir seed sin chocar con UNIQUE FK en `appointmentId`.
- **D6.** `agenda.routes.ts` (receptionist) requiere `doctor_id` como query param. Confirmar que el frontend lo resuelva automáticamente cuando hay una sola doctora.

---

## E. RESUMEN PRIORIZADO

| # | Item | Sección | Bloquea |
|---|---|---|---|
| 1 | Limpiar `'admin'` residual en código y specs | A1 | RBAC roto silenciosamente |
| 2 | Trigger `bloodType=NULL` | A2 | rubric correcciones-schema |
| 3 | Roles PostgreSQL (3: paciente/secretaria/doctora) + grants | A4 | rubric criterio 7 |
| 4 | `sp_get_available_slots` | A5 | rubric SP count=4 |
| 5 | `CancelAppointment` use case + ruta | A6 | flujo secretaria, B7, C4 |
| 6 | `CompleteConsultation` use case + ruta | A7 | flujo doctora, C1 |
| 7 | `RegisterPatient` (receptionist) use case + ruta | A8 | C3 |
| 8 | Módulo `MedicalInsurances` CRUD completo | B1 | C5 |
| 9 | Guard "no auto-eliminación" en DeactivateUser | B2 | seguridad admin |
| 10 | Vista expediente/consulta clínica doctor | C1 | UAT doctora |
| 11 | Vista registrar paciente (secretaria) | C3 | UAT secretaria |
| 12 | UI cancelar cita en agenda secretaria | C4 | UAT secretaria |
| 13 | UI CRUD aseguradoras en panel doctor | C5 | UAT admin |
| 14 | Seed ≥25 ClinicalConsultations | D4 | rubric ≥25/tabla |
| 15 | Validar overlaps con appointments al crear bloques/horarios | B8/B9 | integridad datos |
