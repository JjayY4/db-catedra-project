import { z } from 'zod'

export const slotDurationSchema = z.union([
  z.literal(15), z.literal(30), z.literal(45), z.literal(60),
])

export const generateScheduleInputSchema = z.object({
  selectedDays:  z.array(z.number().int().min(0).max(6)).min(1, 'Selecciona al menos un día'),
  startTime:     z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  endTime:       z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:mm'),
  slotDuration:  slotDurationSchema,
  weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const scheduleSlotSchema = z.object({
  eventDate: z.string(),
  startTime: z.string(),
  endTime:   z.string(),
})

export const previewScheduleOutputSchema = z.object({
  preview:     z.array(scheduleSlotSchema),
  conflicting: z.array(scheduleSlotSchema),
})

export const generateScheduleOutputSchema = z.object({
  created: z.number().int(),
  skipped: z.number().int(),
})

export type SlotDuration            = z.infer<typeof slotDurationSchema>
export type GenerateScheduleInput   = z.infer<typeof generateScheduleInputSchema>
export type ScheduleSlot            = z.infer<typeof scheduleSlotSchema>
export type PreviewScheduleOutput   = z.infer<typeof previewScheduleOutputSchema>
export type GenerateScheduleOutput  = z.infer<typeof generateScheduleOutputSchema>
