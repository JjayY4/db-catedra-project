'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { clientApi } from '@/shared/api/client'
import { Button } from '@/components/ui/button'

interface Props {
  id:          string
  insurerName: string
}

export function EliminarAseguradoraButton({ id, insurerName }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (!window.confirm(`¿Eliminar la aseguradora "${insurerName}"? Esta acción no se puede deshacer.`)) return
    setError(null)
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: apiError } = await (clientApi as any).patients.insurances({ id }).delete()
      if (apiError) {
        const val = apiError.value
        const status: number = apiError.status
        setError(
          status === 422 && val && typeof val === 'object' && 'message' in val && typeof val.message === 'string'
            ? val.message
            : 'No se pudo eliminar la aseguradora.',
        )
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={isPending}
        onClick={handleClick}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Eliminar</span>
      </Button>
      {error && <p className="text-xs text-destructive text-right max-w-[200px]">{error}</p>}
    </div>
  )
}
