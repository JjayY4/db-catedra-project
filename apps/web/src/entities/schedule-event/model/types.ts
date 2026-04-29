import type { ScheduleEvent } from '@project/db/src/schema'

export type { ScheduleEvent }

export interface AvailableSlot {
  id: string
  eventDate: string
  startTime: string
  endTime: string
  doctorName?: string
  specialty?: string
}
