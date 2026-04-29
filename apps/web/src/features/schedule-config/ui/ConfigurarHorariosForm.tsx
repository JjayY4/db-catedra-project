'use client'

import { useState, useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientApi } from '@/shared/api/client'
import {
  generateScheduleInputSchema,
  type GenerateScheduleInput,
  type PreviewScheduleOutput,
} from '@/entities/schedule-event'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const DAYS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
] as const

const DURATIONS: Array<{ value: 15 | 30 | 45 | 60; label: string }> = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '60 minutos' },
]

function nextWeekStart(): string {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  today.setUTCDate(today.getUTCDate() + 1)
  return today.toISOString().slice(0, 10)
}

function formatTime(t: string): string {
  return t.slice(0, 5)
}

function formatDate(d: string): string {
  return new Date(`${d}T00:00:00.000Z`).toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC',
  })
}

export function ConfigurarHorariosForm() {
  const [previewState, setPreviewState] = useState<PreviewScheduleOutput | null>(null)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null)
  const [isPreviewing, startPreview] = useTransition()
  const [isConfirming, startConfirm] = useTransition()

  const { register, handleSubmit, control, getValues, formState: { errors } } = useForm<GenerateScheduleInput>({
    resolver: zodResolver(generateScheduleInputSchema),
    defaultValues: {
      selectedDays:  [],
      startTime:     '08:00',
      endTime:       '12:00',
      slotDuration:  30,
      weekStartDate: nextWeekStart(),
    },
  })

  function onPreviewSubmit(values: GenerateScheduleInput) {
    setFeedback(null)
    startPreview(async () => {
      const { data, error } = await clientApi.doctor.schedule.preview.post(values)
      if (error) {
        const message = typeof error.value === 'object' && error.value && 'message' in error.value
          ? String((error.value as { message: unknown }).message)
          : 'No se pudo generar la vista previa'
        setFeedback({ kind: 'error', message })
        setPreviewState(null)
        return
      }
      setPreviewState(data)
    })
  }

  function onConfirm() {
    const values = getValues()
    setFeedback(null)
    startConfirm(async () => {
      const { data, error } = await clientApi.doctor.schedule.generate.post(values)
      if (error) {
        const message = typeof error.value === 'object' && error.value && 'message' in error.value
          ? String((error.value as { message: unknown }).message)
          : 'No se pudo confirmar el horario'
        setFeedback({ kind: 'error', message })
        return
      }
      setFeedback({
        kind: 'success',
        message: `${data.created} horarios creados. ${data.skipped} ignorados por solapamiento.`,
      })
      setPreviewState(null)
    })
  }

  const isBusy = isPreviewing || isConfirming

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parámetros del horario</CardTitle>
          <CardDescription>
            Selecciona los días, define el rango horario y la duración de cada cita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPreviewSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Días disponibles</Label>
              <Controller
                control={control}
                name="selectedDays"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {DAYS.map((day) => {
                      const checked = field.value.includes(day.value)
                      return (
                        <label
                          key={day.value}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              const next = value
                                ? [...field.value, day.value]
                                : field.value.filter((v) => v !== day.value)
                              field.onChange(next)
                            }}
                          />
                          {day.label}
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.selectedDays && (
                <p className="text-xs text-red-600">{errors.selectedDays.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <Input id="startTime" type="time" {...register('startTime')} />
                {errors.startTime && (
                  <p className="text-xs text-red-600">{errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="endTime">Hora de fin</Label>
                <Input id="endTime" type="time" {...register('endTime')} />
                {errors.endTime && (
                  <p className="text-xs text-red-600">{errors.endTime.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Duración por cita</Label>
                <Controller
                  control={control}
                  name="slotDuration"
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value) as 15 | 30 | 45 | 60)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Duración" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="weekStartDate">Inicio de la semana</Label>
              <Input id="weekStartDate" type="date" {...register('weekStartDate')} />
              {errors.weekStartDate && (
                <p className="text-xs text-red-600">{errors.weekStartDate.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isBusy}>
              {isPreviewing ? 'Calculando…' : 'Generar vista previa'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {feedback && (
        <Alert
          className={
            feedback.kind === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 text-sm p-3 rounded-md'
              : 'border-red-200 bg-red-50 text-red-800 text-sm p-3 rounded-md'
          }
        >
          {feedback.message}
        </Alert>
      )}

      {previewState && (
        <Card>
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
            <CardDescription>
              {previewState.preview.length} bloques se crearán. {previewState.conflicting.length} se ignorarán por solapamiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {previewState.preview.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora inicio</TableHead>
                    <TableHead>Hora fin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewState.preview.map((slot) => (
                    <TableRow key={`${slot.eventDate}-${slot.startTime}`}>
                      <TableCell className="capitalize">{formatDate(slot.eventDate)}</TableCell>
                      <TableCell>{formatTime(slot.startTime)}</TableCell>
                      <TableCell>{formatTime(slot.endTime)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay bloques nuevos para generar con estos parámetros.
              </p>
            )}

            <Button
              type="button"
              onClick={onConfirm}
              disabled={isBusy || previewState.preview.length === 0}
            >
              {isConfirming ? 'Confirmando…' : 'Confirmar horario'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
