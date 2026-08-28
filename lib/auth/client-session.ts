'use client'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/user-store'
import { invalidateAuthenticatedRead } from '@/lib/client/authenticated-read'

export async function logoutClientSession(): Promise<void> {
  const tasks: Promise<unknown>[] = [
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    }),
  ]

  if (auth) {
    tasks.push(signOut(auth))
  }

  await Promise.allSettled(tasks)

  invalidateAuthenticatedRead()
  useUserStore.getState().clearUser()

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('emailForSignIn')
  }
}
