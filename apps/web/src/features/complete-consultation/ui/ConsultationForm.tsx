'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'

interface ConsultationFormValues {
  symptoms:            string
  bloodPressure:       string
  weight:              string
  mainDiagnosis:       string
  prescribedTreatment: string
  doctorPrivateNotes:  string
}

interface ConsultationFormProps {
  appointmentId: string
}

export function ConsultationForm({ appointmentId }: ConsultationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ConsultationFormValues>({
    defaultValues: {
      symptoms:            '',
      bloodPressure:       '',
      weight:              '',
      mainDiagnosis:       '',
      prescribedTreatment: '',
      doctorPrivateNotes:  '',
    },
  })

  function onSubmit(values: ConsultationFormValues) {
    setServerError(null)
    startTransition(async () => {
      const { error } = await (clientApi['medical-records'] as any)({ appointmentId }).consultation.post({
        symptoms:            values.symptoms || undefined,
        bloodPressure:       values.bloodPressure || undefined,
        weight:              values.weight ? Number(values.weight) : undefined,
        mainDiagnosis:       values.mainDiagnosis,
        prescribedTreatment: values.prescribedTreatment || undefined,
        doctorPrivateNotes:  values.doctorPrivateNotes || undefined,
      })
      if (error) {
        const val = error.value
        const message =
          val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
            ? val.message
            : 'No se pudo registrar la consulta. Intenta de nuevo.'
        setServerError(message)
        return
      }
      setSuccess(true)
      router.refresh()
    })
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Consulta registrada exitosamente.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive" className="text-sm">
          {serverError}
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="symptoms">Síntomas presentados</Label>
        <Textarea
          id="symptoms"
          rows={3}
          placeholder="Describe los síntomas del paciente"
          disabled={isPending}
          {...register('symptoms')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="bloodPressure">Presión arterial</Label>
          <Input
            id="bloodPressure"
            placeholder="120/80"
            disabled={isPending}
            {...register('bloodPressure')}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="70"
            disabled={isPending}
            {...register('weight')}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="mainDiagnosis">
          Diagnóstico principal <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="mainDiagnosis"
          rows={3}
          placeholder="Diagnóstico principal de la consulta"
          disabled={isPending}
          {...register('mainDiagnosis', { required: 'El diagnóstico es obligatorio' })}
        />
        {errors.mainDiagnosis && (
          <p className="text-xs text-red-600">{errors.mainDiagnosis.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="prescribedTreatment">Tratamiento prescrito</Label>
        <Textarea
          id="prescribedTreatment"
          rows={3}
          placeholder="Medicamentos y tratamiento indicado"
          disabled={isPending}
          {...register('prescribedTreatment')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="doctorPrivateNotes">Notas privadas (solo visible para el médico)</Label>
        <Textarea
          id="doctorPrivateNotes"
          rows={3}
          placeholder="Observaciones internas"
          disabled={isPending}
          {...register('doctorPrivateNotes')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando…' : 'Registrar consulta'}
      </Button>
    </form>
  )
}
