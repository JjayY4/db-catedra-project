import Link from 'next/link'
import { LoginForm } from '@/features/auth'
import { Alert } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginPage({ registered = false }: { registered?: boolean }) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your MediSystem account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {registered && (
          <Alert className="border-green-200 bg-green-50 text-green-800 text-sm p-3 rounded-md">
            Account created. Sign in with your credentials.
          </Alert>
        )}
        <LoginForm />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-slate-900 underline underline-offset-4">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
