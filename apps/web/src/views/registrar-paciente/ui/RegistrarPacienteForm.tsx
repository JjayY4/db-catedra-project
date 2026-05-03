'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { clientApi } from '@/shared/api/client'
import type { InsuranceOutput } from '@project/api/src/modules/patients/application/dtos/outputs/insurance.output'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

interface RegisterPatientValues {
  email:       string
  password:    string
  firstName:   string
  lastName:    string
  dui:         string
  birthDate:   string
  whatsapp:    string
  insuranceId: string
}

interface Props {
  onSuccess?: () => void
}

export function RegistrarPacienteForm({ onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const [insurances, setInsurances] = useState<InsuranceOutput[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterPatientValues>({
    defaultValues: {
      email:       '',
      password:    '',
      firstName:   '',
      lastName:    '',
      dui:         '',
      birthDate:   '',
      whatsapp:    '',
      insuranceId: '',
    },
  })

  useEffect(() => {
    clientApi.patients.insurances.get().then(({ data }) => {
      if (data) setInsurances(data)
    })
  }, [])

  function onSubmit(values: RegisterPatientValues) {
    setServerError(null)
    startTransition(async () => {
      const { error, data } = await clientApi.patients.register.post({
        email:       values.email,
        password:    values.password,
        firstName:   values.firstName,
        lastName:    values.lastName,
        dui:         values.dui,
        birthDate:   values.birthDate,
        whatsapp:    values.whatsapp,
        insuranceId: values.insuranceId || null,
      })
      if (error) {
        const val = error.value
        const status: number = error.status
        if (status === 409) {
          const msg = val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
            ? val.message : ''
          if (msg.toLowerCase().includes('dui')) {
            setServerError('Ya existe un paciente con este DUI.')
          } else if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('user')) {
            setServerError('Ya existe una cuenta con este email.')
          } else {
            setServerError(msg || 'El paciente ya está registrado.')
          }
          return
        }
        const message =
          val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
            ? val.message
            : 'No se pudo registrar el paciente. Intenta de nuevo.'
        setServerError(message)
        return
      }
      reset()
      router.refresh()
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <Alert variant="destructive" className="text-sm">{serverError}</Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="paciente@ejemplo.com"
              disabled={isPending}
              {...register('email', { required: 'El correo es obligatorio' })}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isPending}
              {...register('password', {
                required:  'La contraseña es obligatoria',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">Nombres</Label>
              <Input id="firstName" disabled={isPending} {...register('firstName', { required: 'Obligatorio' })} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input id="lastName" disabled={isPending} {...register('lastName', { required: 'Obligatorio' })} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="dui">DUI (9 dígitos sin guión)</Label>
            <Input
              id="dui"
              maxLength={9}
              placeholder="123456789"
              disabled={isPending}
              {...register('dui', {
                required:  'El DUI es obligatorio',
                minLength: { value: 9, message: 'El DUI debe tener 9 caracteres' },
                maxLength: { value: 9, message: 'El DUI debe tener 9 caracteres' },
              })}
            />
            {errors.dui && <p className="text-xs text-destructive">{errors.dui.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                disabled={isPending}
                {...register('birthDate', { required: 'Obligatorio' })}
              />
              {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                placeholder="+50312345678"
                disabled={isPending}
                {...register('whatsapp', { required: 'Obligatorio' })}
              />
              {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="insuranceId">Aseguradora (opcional)</Label>
            <select
              id="insuranceId"
              disabled={isPending}
              {...register('insuranceId')}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
              defaultValue=""
            >
              <option value="">Sin aseguradora</option>
              {insurances.map((ins) => (
                <option key={ins.id} value={ins.id}>
                  {ins.insurerName} — {ins.coverageType}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Registrando…' : 'Registrar paciente'}
          </Button>
    </form>
  )
}
