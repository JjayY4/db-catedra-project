import { injectable } from 'inversify'
import { and, asc, eq, gte, lt } from 'drizzle-orm'
import type { TxClient } from '@project/db/src/client'
import { ScheduleEvents } from '@project/db/src/schema/schedule-events.schema'
import { IScheduleEventsRepository } from '../../domain/interfaces/schedule-events.repository'
import type { IScheduleEvent } from '../../domain/entities/schedule-event.entity'

type ScheduleEventRow = typeof ScheduleEvents.$inferSelect

function toEntity(row: ScheduleEventRow): IScheduleEvent {
  return {
    id:                 row.id,
    eventDate:          row.eventDate,
    startTime:          row.startTime,
    endTime:            row.endTime,
    eventType:          row.eventType,
    availabilityStatus: row.availabilityStatus,
    auditUserId:        row.auditUserId,
  }
}

@injectable()
export class DrizzleScheduleEventsRepository extends IScheduleEventsRepository {
  findById = async (id: string, tx: TxClient): Promise<IScheduleEvent | null> => {
    const row = await tx.query.ScheduleEvents.findFirst({ where: eq(ScheduleEvents.id, id) })
    return row ? toEntity(row) : null
  }

  findAvailable = async (dateFrom: string, dateTo: string, tx: TxClient): Promise<IScheduleEvent[]> => {
    const rows = await tx
      .select()
      .from(ScheduleEvents)
      .where(
        and(
          eq(ScheduleEvents.eventType, 'appointment'),
          eq(ScheduleEvents.availabilityStatus, 'available'),
          gte(ScheduleEvents.eventDate, dateFrom),
          lt(ScheduleEvents.eventDate, dateTo),
        ),
      )
      .orderBy(asc(ScheduleEvents.eventDate), asc(ScheduleEvents.startTime))
    return rows.map(toEntity)
  }
}
