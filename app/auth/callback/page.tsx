'use client'

export const dynamic = 'force-dynamic'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/user-store'

type CallbackStatus =
  | 'loading'
  | 'needs-email'
  | 'signing-in'
  | 'success'
  | 'error'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setUser } = useUserStore()

  const [status, setStatus] = useState<CallbackStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [magicLink, setMagicLink] = useState('')

  const completeSignIn = useCallback(
    async (emailAddress: string, link: string) => {
      const normalizedEmail = emailAddress.trim()

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        setError('Please enter the email address that received this magic link.')
        setStatus('needs-email')
        return
      }

      try {
        setError(null)
        setStatus('signing-in')

        const firebaseAuth = getFirebaseAuth()

        if (!firebaseAuth) {
          throw new Error(
            'Firebase authentication is unavailable. Please try again.'
          )
        }

        if (!isSignInWithEmailLink(firebaseAuth, link)) {
          throw new Error(
            'This magic link is invalid or has expired. Please request a new one.'
          )
        }

        const result = await signInWithEmailLink(
          firebaseAuth,
          normalizedEmail,
          link
        )

        const idToken = await result.user.getIdToken()

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.error || 'Signed in with Firebase, but session creation failed.'
          )
        }

        window.localStorage.removeItem('emailForSignIn')

        setUser({
          uid: data.uid,
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
          dob: null,
          tob: null,
          pob: null,
          rashi: null,
          nakshatra: null,
          subscription: data.subscription || 'free',
          subscriptionExpiry: data.subscriptionExpiry
            ? new Date(data.subscriptionExpiry)
            : null,
          tickets: data.tickets || 0,
          aiGuruTickets: data.aiGuruTickets || data.tickets || 0,
          kundaliTickets: data.kundaliTickets || 0,
          lifetimePredictions: data.lifetimePredictions || 0,
          dailyUsage:
            data.dailyUsage || {
              count: 0,
              date: new Date().toISOString().split('T')[0],
            },
          onboarded: data.onboarded || false,
        })

        setStatus('success')

        router.replace(data.onboarded ? '/dashboard' : '/onboarding')
      } catch (callbackError: unknown) {
        console.error('Magic-link callback error:', callbackError)

        const message =
          callbackError instanceof Error
            ? callbackError.message
            : 'Authentication failed. Please request a new magic link.'

        setError(message)
        setStatus('error')
      }
    },
    [router, setUser]
  )

  useEffect(() => {
    const link = window.location.href
    setMagicLink(link)

    const firebaseAuth = getFirebaseAuth()

    if (!firebaseAuth) {
      setError('Firebase authentication is unavailable. Please try again.')
      setStatus('error')
      return
    }

    if (!isSignInWithEmailLink(firebaseAuth, link)) {
      setError(
        'This magic link is invalid or has expired. Please request a new one.'
      )
      setStatus('error')
      return
    }

    const storedEmail = window.localStorage.getItem('emailForSignIn')

    if (storedEmail) {
      setEmail(storedEmail)
      void completeSignIn(storedEmail, link)
      return
    }

    // Cross-device / different-browser recovery:
    // Firebase requires the original email address to complete email-link sign-in.
    setStatus('needs-email')
  }, [completeSignIn])

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!magicLink) {
      setError('Magic link information is unavailable. Please request a new link.')
      setStatus('error')
      return
    }

    await completeSignIn(email, magicLink)
  }

  if (status === 'loading' || status === 'signing-in') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-mystic border-t-transparent" />
          <p className="text-muted-foreground">
            {status === 'signing-in'
              ? 'Signing you in securely...'
              : 'Verifying your magic link...'}
          </p>
        </div>
      </main>
    )
  }

  if (status === 'needs-email') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Confirm your email</h1>
            <p className="text-sm text-muted-foreground">
              Enter the email address where you received this magic link.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <label htmlFor="magic-link-email" className="text-sm font-medium">
                Email address
              </label>

              <input
                id="magic-link-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border bg-background px-3 py-2 text-foreground outline-none ring-offset-background focus:ring-2 focus:ring-ring"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
            >
              Continue securely
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Request a new magic link
          </button>
        </div>
      </main>
    )
  }

  if (status === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold">We couldn't sign you in</h1>

          <p className="text-sm text-destructive">
            {error || 'Authentication failed.'}
          </p>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            Back to Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="space-y-3 text-center">
        <p className="text-lg font-medium text-green-600">
          ✓ Successfully signed in
        </p>
        <p className="text-muted-foreground">Taking you to Jyoti...</p>
      </div>
    </main>
  )
}
