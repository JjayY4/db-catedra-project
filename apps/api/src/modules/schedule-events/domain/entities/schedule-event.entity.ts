export interface IScheduleEvent {
  id:                 string
  eventDate:          string
  startTime:          string
  endTime:            string
  eventType:          string
  availabilityStatus: string
  auditUserId:        string | null
}
