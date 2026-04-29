import { z } from 'zod'

export const blockTypeSchema = z.enum(['meeting', 'vacation', 'block'])

const timeRegex = /^\d{2}:\d{2}$/
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const createBlockInputSchema = z.object({
  date:      z.string().regex(dateRegex, 'Fecha inválida').refine((value) => {
    const today = new Date().toISOString().slice(0, 10)
    return value >= today
  }, 'La fecha no puede ser pasada'),
  startTime: z.string().regex(timeRegex, 'Hora inicio inválida'),
  endTime:   z.string().regex(timeRegex, 'Hora fin inválida'),
  blockType: blockTypeSchema,
}).refine((value) => value.startTime < value.endTime, {
  message: 'La hora de inicio debe ser menor que la de fin',
  path:    ['endTime'],
})

export type BlockType        = z.infer<typeof blockTypeSchema>
export type CreateBlockInput = z.infer<typeof createBlockInputSchema>

export const scheduleEventSchema = z.object({
  id:        z.string().uuid(),
  eventDate: z.string(),
  startTime: z.string(),
  endTime:   z.string(),
  eventType: z.enum(['appointment', 'block', 'vacation', 'meeting']),
})

export type ScheduleEventModel = z.infer<typeof scheduleEventSchema>
