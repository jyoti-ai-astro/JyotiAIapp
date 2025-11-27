'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      // Send to backend to create session
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update user store
        const { setUser } = useUserStore.getState()
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

        // Redirect based on onboarding status
        if (data.onboarded) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Google login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Store email for callback
      window.localStorage.setItem('emailForSignIn', email)
      
      // Call backend API to send magic link via ZeptoMail
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to send magic link')
      }

      alert('Check your email for the login link!')
      setEmail('') // Clear email field
    } catch (error: any) {
      console.error('Email link error:', error)
      alert(error.message || 'Failed to send email link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cosmic via-mystic to-gold p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white/10 backdrop-blur-lg p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-2">Jyoti.ai</h1>
          <p className="text-white/80">Sign in to your spiritual journey</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-cosmic hover:bg-white/90"
            size="lg"
          >
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-transparent px-2 text-white/60">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLink} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-md border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-gold"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-mystic text-white hover:bg-mystic-light"
              size="lg"
            >
              Send Magic Link
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

