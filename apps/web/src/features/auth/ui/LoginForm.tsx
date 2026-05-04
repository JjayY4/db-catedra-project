'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from '@/shared/auth/client'
import { loginSchema, type LoginFormValues } from '@/entities/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'

function mapAuthError(err: { message?: string; status?: number }): string {
  if (err.status === 429) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  if (err.status === 403) return 'Tu cuenta no está verificada. Revisa tu correo electrónico.'
  const msg = err.message?.toLowerCase() ?? ''
  if (msg.includes('invalid email or password') || msg.includes('invalid credentials')) {
    return 'Correo o contraseña incorrectos.'
  }
  if (msg.includes('email not verified')) return 'Debes verificar tu correo antes de iniciar sesión.'
  if (msg.includes('user not found'))     return 'No existe una cuenta con ese correo.'
  if (msg.includes('too many'))           return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  return err.message ?? 'Ocurrió un error al iniciar sesión. Intenta de nuevo.'
}

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(values: LoginFormValues) {
    setError(null)
    setLoading(true)
    try {
      const { error: authError } = await signIn.email({
        email:    values.email,
        password: values.password,
      })
      if (authError) {
        setError(mapAuthError(authError))
        return
      }
      router.push('/dashboard')
    } catch {
      setError('No se pudo conectar al servidor. Verifica que el API esté activo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50 text-red-800 text-sm p-3 rounded-md">
          {error}
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@correo.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>
    </form>
  )
}
