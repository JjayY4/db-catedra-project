'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

interface Props {
  recordId:          string
  bloodType?:        string | null
  knownAllergies?:   string | null
  familyHistory?:    string | null
  chronicConditions?: string | null
}

export function EditarAntecedentesDialog({ recordId, bloodType, knownAllergies, familyHistory, chronicConditions }: Props) {
  const router = useRouter()
  const [open, setOpen]           = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError]         = useState<string | null>(null)

  const [bt, setBt]    = useState(bloodType ?? '')
  const [ka, setKa]    = useState(knownAllergies ?? '')
  const [fh, setFh]    = useState(familyHistory ?? '')
  const [cc, setCc]    = useState(chronicConditions ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const { error: apiError } = await (clientApi as any)['medical-records']({ recordId: recordId }).background.patch({
        bloodType:         bt || null,
        knownAllergies:    ka || null,
        familyHistory:     fh || null,
        chronicConditions: cc || null,
      })
      if (apiError) {
        setError('No se pudo actualizar los antecedentes.')
        return
      }
      router.refresh()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        <Pencil className="h-3.5 w-3.5" />
        Editar antecedentes
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Antecedentes médicos</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Tipo de sangre</Label>
            <Select value={bt} onValueChange={(v) => setBt(v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Alergias conocidas</Label>
            <Textarea value={ka} onChange={(e) => setKa(e.target.value)} rows={2} placeholder="Ej. Penicilina, látex…" />
          </div>

          <div className="space-y-1.5">
            <Label>Antecedentes familiares</Label>
            <Textarea value={fh} onChange={(e) => setFh(e.target.value)} rows={2} placeholder="Ej. Diabetes, hipertensión…" />
          </div>

          <div className="space-y-1.5">
            <Label>Condiciones crónicas</Label>
            <Textarea value={cc} onChange={(e) => setCc(e.target.value)} rows={2} placeholder="Ej. Asma, hipotiroidismo…" />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
