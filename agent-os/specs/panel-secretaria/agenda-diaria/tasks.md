# Tasks: Agenda Diaria (Secretaria)

## Task 1 — Guardar documentación ✅
Archivos de spec creados en `agent-os/specs/panel-secretaria/agenda-diaria/`.

---

## Task 2 — Output DTO del use case receptionist
**Skill:** `/backend-architecture`

1. Crear `apps/api/src/modules/agenda/application/dtos/outputs/receptionist-agenda-item.output.ts`.
   - Campos: `slotId`, `startTime`, `endTime`, `availabilityStatus`, `patientName`, `bookingReason`, `whatsappPhone`, `appointmentId`.
2. Exportar desde el barrel del módulo agenda.

---

## Task 3 — Use case GetDailyAgendaReceptionist
**Skill:** `/backend-architecture`

1. Crear `apps/api/src/modules/agenda/application/usecases/get-daily-agenda-receptionist.usecase.ts`.
   - Parámetro: `fecha: string` (YYYY-MM-DD).
   - Inyectar `IAgendaRepository` (token abstracto existente o nuevo).
   - Llamar al repositorio → mapear a `ReceptionistAgendaItemOutput[]`.
2. Registrar el use case en el módulo Inversify de agenda.

---

## Task 4 — Repositorio: query DailyScheduleView por fecha
**Skill:** `/tech-drizzle`

1. En `apps/api/src/modules/agenda/infrastructure/repositories/agenda.repository.ts`:
   - Añadir método `getDailyAgendaForReceptionist(fecha: Date): Promise<ReceptionistAgendaItemOutput[]>`.
   - Query `db.select().from(dailyScheduleView).where(eq(dailyScheduleView.date, fecha)).orderBy(asc(dailyScheduleView.startTime))`.
   - Usar `$inferSelect` del view para tipado seguro.
2. Actualizar la interfaz abstracta `IAgendaRepository`.

---

## Task 5 — Ruta API GET /agenda
**Skill:** `/tech-elysia`

1. En `apps/api/src/modules/agenda/presentation/agenda.routes.ts`:
   - Añadir `GET /agenda` con query param `fecha` (string, formato YYYY-MM-DD, default hoy).
   - Aplicar macro de autenticación receptionist/admin.
   - Resolver `GetDailyAgendaReceptionistUseCase` desde el contenedor Inversify.
   - Retornar `ReceptionistAgendaItemOutput[]`.

---

## Task 6 — Widget AgendaTable
**Skill:** `/frontend-architecture`, `/tailwind-css-patterns`, `/frontend-design`

1. Crear `apps/web/src/widgets/agenda-table/ui/AgendaTableWidget.tsx`.
   - Props: `items: ReceptionistAgendaItemOutput[]`, `fecha: string`.
   - Si `items.length === 0` → mostrar `<EmptyAgenda />` con texto "No hay agenda configurada para esta fecha."
   - Si hay items → renderizar tabla shadcn (`Table`, `TableHeader`, `TableRow`, `TableCell`) con:
     - Columnas: Hora, Estado (badge), Paciente, Motivo, WhatsApp, Acciones.
     - Variante de color por fila según `availabilityStatus` (ver `spec.md`).
   - Botón "Cancelar" (visible si `busy`) y "Reservar" (visible si `available`) como Client Components separados.
2. Crear `apps/web/src/widgets/agenda-table/index.ts` (barrel).

---

## Task 7 — Navegación de fecha
**Skill:** `/next-best-practices`

1. Crear `apps/web/src/widgets/agenda-table/ui/DateNav.tsx` (Client Component).
   - Recibe `fecha: string` (YYYY-MM-DD).
   - Botones prev/next actualizan `?fecha=` via `useRouter().push`.
   - Date picker con `<input type="date">` o shadcn `Calendar` + `Popover`.

---

## Task 8 — Vista AgendaSecretariaPage (RSC)
**Skill:** `/frontend-architecture`, `/next-best-practices`

1. Crear `apps/web/src/views/agenda-secretaria/ui/AgendaSecretariaPage.tsx`.
   - RSC. Recibe `{ fecha: string }`.
   - Llama `api.agenda.get({ query: { fecha } })` con Eden Treaty (client.ts servidor).
   - Aplica `requireReceptionistOrAdmin()` de `guards.server.ts`.
   - Renderiza `<DateNav fecha={fecha} />` + `<AgendaTableWidget items={data} fecha={fecha} />`.
2. Crear `apps/web/src/views/agenda-secretaria/index.ts` (barrel).

---

## Task 9 — Thin page Next.js
**Skill:** `/next-best-practices`

1. Crear `apps/web/src/app/(receptionist)/agenda/page.tsx`.
   - Parsear `searchParams.fecha` (awaited, Next.js 15+).
   - Si ausente, usar `new Date().toISOString().split('T')[0]`.
   - Renderizar `<AgendaSecretariaPage fecha={fecha} />`.
