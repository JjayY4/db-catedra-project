import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingHeroWidget() {
  return (
    <section className="flex flex-col items-center justify-center text-center gap-8 py-24 px-6">
      <div className="flex flex-col items-center gap-4 max-w-2xl">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">
          Medical Management System
        </span>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          Healthcare, simplified.
        </h1>
        <p className="text-lg text-slate-600 max-w-md">
          Manage patients, appointments, and medical records from a single platform — built for every role in your clinic.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/login" className={cn(buttonVariants({ size: 'lg' }))}>
          Sign in
        </Link>
        <Link href="/register" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}>
          Create account
        </Link>
      </div>
    </section>
  )
}
