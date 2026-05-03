'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const COVERAGE_OPTIONS = [
  { value: 'basic',         label: 'Básico' },
  { value: 'complete',      label: 'Completo' },
  { value: 'dental',        label: 'Dental' },
  { value: 'vision',        label: 'Visión' },
  { value: 'comprehensive', label: 'Integral' },
] as const

interface Props {
  insurance: { id: string; insurerName: string; coverageType: string }
}

interface FormValues {
  insurerName:  string
  coverageType: typeof COVERAGE_OPTIONS[number]['value']
}

export function EditarAseguradoraDialog({ insurance }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      insurerName:  insurance.insurerName,
      coverageType: insurance.coverageType as typeof COVERAGE_OPTIONS[number]['value'],
    },
  })

  function onSubmit(values: FormValues) {
    setError(null)
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: apiError } = await (clientApi as any).patients.insurances({ id: insurance.id }).patch(values)
      if (apiError) {
        const val = apiError.value
        setError(
          val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
            ? val.message
            : 'No se pudo actualizar la aseguradora.',
        )
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null) }}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="h-8 w-8 p-0" />}>
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar aseguradora</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {error && <Alert variant="destructive" className="text-sm">{error}</Alert>}

          <div className="space-y-1">
            <Label htmlFor="edit-insurerName">Nombre de la aseguradora</Label>
            <Input
              id="edit-insurerName"
              disabled={isPending}
              {...register('insurerName', { required: 'El nombre es obligatorio' })}
            />
            {errors.insurerName && <p className="text-xs text-destructive">{errors.insurerName.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-coverageType">Tipo de cobertura</Label>
            <select
              id="edit-coverageType"
              disabled={isPending}
              {...register('coverageType')}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              {COVERAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
