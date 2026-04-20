'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/shared/auth/client'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <Button variant="outline" size="sm" onClick={handleSignOut}>
      Sign out
    </Button>
  )
}
