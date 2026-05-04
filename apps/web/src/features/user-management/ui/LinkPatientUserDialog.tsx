'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { UserPlus } from 'lucide-react'
import { UserRole } from '@project/enums/src/user-role.enum'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

interface FormValues {
  email:    string
  password: string
}

interface LinkPatientUserDialogProps {
  patientDui:  string
  patientName: string
}

export function LinkPatientUserDialog({ patientDui, patientName }: LinkPatientUserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const { error } = await clientApi.users.create.post({
      name:       patientName,
      email:      values.email,
      password:   values.password,
      role:       UserRole.Patient,
      patientDui,
    } as any)

    if (error) {
      const val = error.value
      const message =
        val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
          ? val.message
          : 'No se pudo crear la cuenta'
      setServerError(message)
      return
    }

    reset()
    setOpen(false)
    startTransition(() => router.refresh())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <UserPlus className="h-3.5 w-3.5" />
            Crear cuenta
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear cuenta para {patientName}</DialogTitle>
          <DialogDescription>
            Se creará un acceso al sistema vinculado a este paciente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {serverError && (
            <Alert variant="destructive" className="text-sm">
              {serverError}
            </Alert>
          )}
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input value={patientName} disabled className="opacity-70" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-email">Email</Label>
            <Input
              id="link-email"
              type="email"
              {...register('email', { required: 'Requerido' })}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="link-password">Contraseña</Label>
            <Input
              id="link-password"
              type="password"
              {...register('password', {
                required: 'Requerido',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              })}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando…' : 'Crear cuenta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
