'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmailLink, getAuth } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useUserStore } from '@/store/user-store'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUserStore()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get email from localStorage (Firebase stores it)
        const email = window.localStorage.getItem('emailForSignIn')
        
        if (!email) {
          throw new Error('Email not found. Please request a new magic link.')
        }

        // Get the full URL with oobCode and mode
        const fullUrl = window.location.href
        const url = new URL(fullUrl)
        const oobCode = url.searchParams.get('oobCode')
        const mode = url.searchParams.get('mode')

        if (!oobCode || mode !== 'signIn') {
          throw new Error('Invalid magic link')
        }

        // Sign in with email link
        const result = await signInWithEmailLink(auth, email, fullUrl)
        const idToken = await result.user.getIdToken()

        // Send to backend to create session
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        })

        if (!response.ok) {
          throw new Error('Failed to create session')
        }

        const data = await response.json()

        // Clear email from localStorage
        window.localStorage.removeItem('emailForSignIn')

        // Update user store
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
          subscription: 'free',
          subscriptionExpiry: null,
          onboarded: data.onboarded || false,
        })

        setStatus('success')

        // Redirect based on onboarding status
        setTimeout(() => {
          if (data.onboarded) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        }, 1000)
      } catch (error: any) {
        console.error('Callback error:', error)
        setError(error.message || 'Authentication failed')
        setStatus('error')
      }
    }

    handleCallback()
  }, [router, setUser])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-mystic border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Verifying your magic link...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-lg text-green-600">✓ Successfully signed in!</p>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}

