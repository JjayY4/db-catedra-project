'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  page:       number
  totalPages: number
  total:      number
  pageSize:   number
  search?:    string
  label?:     string
}

export function PaginationControls({ page, totalPages, total, pageSize, search, label = 'paciente' }: Props) {
  const from         = (page - 1) * pageSize + 1
  const to           = Math.min(page * pageSize, total)
  const searchSuffix = search ? `&search=${encodeURIComponent(search)}` : ''

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {from}–{to} de {total} {label}{total !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-2">
        <Link
          href={`?page=${page - 1}${searchSuffix}`}
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            page <= 1 && 'pointer-events-none opacity-50',
          )}
        >
          ← Anterior
        </Link>
        <span className="flex items-center px-2 text-xs">
          {page} / {totalPages}
        </span>
        <Link
          href={`?page=${page + 1}${searchSuffix}`}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            page >= totalPages && 'pointer-events-none opacity-50',
          )}
        >
          Siguiente →
        </Link>
      </div>
    </div>
  )
}
