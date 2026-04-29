# Tasks: Reservar Cita

## Task 1 — Guardar documentación ✅
> Status: done (este archivo es la evidencia)

Archivos de spec creados en `agent-os/specs/portal-paciente/reservar-cita/`.

---

## Task 2 — Esquema de base de datos y entidad de dominio
> Skills: `/tech-drizzle`, `/backend-architecture`

- [ ] Agregar tabla `MedicalAppointments` en `packages/database/src/schema/medical-appointments.table.ts`
  - Columnas: `id` (uuid pk), `eventId` (uuid, UNIQUE, FK → ScheduleEvents), `patientDui` (varchar, FK → Patients), `bookingReason` (text), `createdAt` (timestamp default now)
  - Exportar `$inferSelect` / `$inferInsert` types
- [ ] Agregar tabla `WhatsAppMessage` en `packages/database/src/schema/whatsapp-messages.table.ts` (si no existe)
  - Columnas: `id`, `patientDui`, `type` (enum: `'confirmation'|'reminder'`), `payload` (jsonb), `sentAt`, `createdAt`
- [ ] Actualizar `packages/database/src/schema/index.ts` — exportar nuevas tablas antes de relaciones
- [ ] Ejecutar `db:push` en entorno local para validar constraints
- [ ] Crear entidad de dominio `apps/api/src/modules/appointments/domain/entities/appointment.entity.ts`

---

## Task 3 — Capa de repositorio (API)
> Skills: `/tech-drizzle`, `/backend-architecture`

- [ ] Crear interfaz abstracta `apps/api/src/modules/appointments/domain/interfaces/appointments.repository.ts`
  - Método: `book(data: BookAppointmentInput, tx: TxClient): Promise<AppointmentEntity>`
  - Método: `findByEventId(eventId: string): Promise<AppointmentEntity | null>`
- [ ] Implementar `apps/api/src/modules/appointments/infrastructure/repositories/drizzle-appointments.repository.ts`
  - `toEntity()` mapper de `$inferSelect` → `AppointmentEntity`
  - Capturar violación de constraint único y relanzar como `AppError('SLOT_TAKEN', 409)`
- [ ] Registrar token `APPOINTMENTS_REPOSITORY` en el módulo Inversify

---

## Task 4 — DTOs de entrada y salida (API)
> Skills: `/backend-architecture`, `/typescript-advanced-types`

- [ ] Crear `apps/api/src/modules/appointments/application/dtos/inputs/book-appointment.input.ts`
  - Campos: `eventId: string`, `bookingReason: string`
- [ ] Crear `apps/api/src/modules/appointments/application/dtos/outputs/appointment.output.ts`
  - Campos públicos del appointment confirmado: `id`, `eventId`, `bookingReason`, `createdAt`

---

## Task 5 — Use case BookAppointment (API)
> Skills: `/backend-architecture`

- [ ] Crear `apps/api/src/modules/appointments/application/usecases/book-appointment.usecase.ts`
  - `@injectable()`, extender `BaseUseCase<BookAppointmentInput, AppointmentOutput>`
  - Paso 1: buscar `ScheduleEvent` por `eventId`; si no existe o `availabilityStatus !== 'available'` → `throw new AppError('SLOT_UNAVAILABLE', 409)`
  - Paso 2: buscar perfil del paciente por sesión; si no tiene `Patients` record completo → `throw new AppError('PROFILE_INCOMPLETE', 422)`
  - Pasos 3-5 dentro de `db.transaction()`:
    - INSERT en `MedicalAppointments`
    - UPDATE `ScheduleEvent.availabilityStatus = 'busy'`
    - INSERT en `WhatsAppMessage` tipo `'confirmation'`
  - Retornar `AppointmentOutput`
- [ ] Nunca envolver en try/catch — el global error handler de Elysia gestiona `AppError`

---

## Task 6 — Ruta HTTP (API)
> Skills: `/tech-elysia`, `/backend-architecture`

- [ ] Crear `apps/api/src/modules/appointments/presentation/appointments.routes.ts`
  - `POST /appointments` con body schema `{ eventId: t.String(), bookingReason: t.String() }`
  - Aplicar `betterAuthPlugin` para requerir sesión autenticada
  - Llamar `container.get(BookAppointmentUseCase).handle(body)` y retornar resultado
- [ ] Crear `apps/api/src/modules/appointments/appointments.module.ts` — bindings Inversify para use case y repositorio
- [ ] Registrar módulo en `apps/api/src/bootstrap.ts`
- [ ] Registrar ruta en `apps/api/src/app.ts`

---

## Task 7 — Esquemas y tipos en frontend (entities layer)
> Skills: `/frontend-architecture`

- [ ] Crear `apps/web/src/entities/appointment/model/schemas.ts`
  - Schema Zod `bookAppointmentSchema` con `eventId` y `bookingReason` (min 10 chars)
  - Schema `appointmentOutputSchema` para la respuesta del servidor
- [ ] Crear `apps/web/src/entities/appointment/model/types.ts`
  - Exportar `BookAppointmentInput` y `AppointmentOutput` inferidos de los schemas
- [ ] Crear `apps/web/src/entities/appointment/index.ts` — public API del slice

---

## Task 8 — Feature: formulario de reserva (frontend)
> Skills: `/frontend-architecture`, `/frontend-design`, `/tech-elysia`

- [ ] Crear `apps/web/src/features/booking/ui/ReservarCitaForm.tsx` (`'use client'`)
  - Usar `react-hook-form` + `zodResolver(bookAppointmentSchema)`
  - Mostrar slot summary (fecha, startTime, endTime) como datos de solo lectura
  - Textarea para `bookingReason` con label "Motivo de consulta" y contador de caracteres
  - Botón "Confirmar cita" con estado loading via `useTransition`
  - En submit: llamar `clientApi.appointments.post({ eventId, bookingReason })`
  - En éxito: mostrar pantalla de confirmación inline con resumen y botón "Ver mis citas"
  - En error `SLOT_TAKEN` o `SLOT_UNAVAILABLE`: mostrar alerta "Ese cupo ya no está disponible, elige otro horario" + botón para volver al calendario
  - En error `PROFILE_INCOMPLETE`: `router.push('/completar-perfil')`
  - Todos los textos en español
  - Usar componentes de `@/components/ui/` (Card, Button, Textarea, Alert)
- [ ] Crear `apps/web/src/features/booking/index.ts` — public API del slice

---

## Task 9 — View y page (frontend)
> Skills: `/frontend-architecture`, `/next-best-practices`

- [ ] Crear `apps/web/src/views/reservar-cita/ui/ReservarCitaPage.tsx`
  - Server Component que busca el slot por `eventId` via Eden Treaty
  - Si el slot no existe o no está disponible: `notFound()`
  - Renderiza `<ReservarCitaForm>` pasando los datos del slot como props
- [ ] Crear `apps/web/src/views/reservar-cita/index.ts` — public API del slice
- [ ] Crear `apps/web/src/app/(patient)/reservar/[eventId]/page.tsx`
  - Thin page: extraer `params.eventId` y renderizar `<ReservarCitaPage eventId={eventId} />`
  - Exportar `generateMetadata` con título "Confirmar cita"

---

## Task 10 — Prueba manual end-to-end
> Sin skill específico

- [ ] Flujo feliz: paciente confirma cita → ver registro en DB + campo `availabilityStatus = 'busy'`
- [ ] Race condition: intentar doble POST con mismo `eventId` → segundo debe retornar 409
- [ ] Slot no disponible: modificar manualmente `availabilityStatus = 'busy'` e intentar confirmar → debe retornar mensaje correcto en UI
- [ ] Perfil incompleto: eliminar registro de `Patients` del usuario de prueba → debe redirigir a `/completar-perfil`
