import type { TxClient } from "@project/db/src/client";
import type {
  IScheduleEvent,
  ScheduleEventType,
  ConflictingAppointment,
} from "../entities/schedule-event.entity";
import { RepositoryMethod } from "~/common/base/repository-method.type";

export interface SlotInput {
  date: string;
  startTime: string;
  endTime: string;
}

export interface NewBlockSlot extends SlotInput {
  eventType: ScheduleEventType;
}

export abstract class IScheduleEventsRepository {
  abstract findAvailable: RepositoryMethod<
    [dateFrom: string, dateTo: string],
    IScheduleEvent[]
  >;

  abstract findById(id: string, tx: TxClient): Promise<IScheduleEvent | null>;

  abstract findActiveAppointmentForSlot(
    slot: SlotInput,
    tx: TxClient,
  ): Promise<ConflictingAppointment | null>;

  abstract findActiveAppointmentForEvent(
    eventId: string,
    tx: TxClient,
  ): Promise<ConflictingAppointment | null>;

  abstract insertBlocks(
    slots: NewBlockSlot[],
    auditUserId: string,
    tx: TxClient,
  ): Promise<IScheduleEvent[]>;

  abstract deleteById(id: string, tx: TxClient): Promise<void>;
}
