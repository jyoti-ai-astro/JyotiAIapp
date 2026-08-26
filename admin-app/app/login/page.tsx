'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Authentication failed')
      router.replace('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <section className="login-card">
        <div className="muted">JyotiAI Control Plane</div>
        <h1>Admin sign in</h1>
        <p className="muted">Use your authorized JyotiAI staff credentials.</p>
        <form onSubmit={submit}>
          <label className="field">Email<input name="email" type="email" autoComplete="username" required /></label>
          <label className="field">Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          {error ? <div className="error">{error}</div> : null}
        </form>
      </section>
    </main>
  )
}
