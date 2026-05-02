import { z } from 'zod'

export const consultationFormSchema = z.object({
  presentedSymptoms:   z.string().min(1, 'Los síntomas son requeridos'),
  mainDiagnosis:       z.string().min(1, 'El diagnóstico principal es requerido'),
  prescribedTreatment: z.string().min(1, 'El tratamiento es requerido'),
  bloodPressure:       z.string().optional().nullable(),
  weightKg:            z.string().optional().nullable(),
  doctorPrivateNotes:  z.string().optional().nullable(),
})

export type ConsultationFormValues = z.infer<typeof consultationFormSchema>