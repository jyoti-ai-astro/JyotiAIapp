'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'

import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedEmail = email.trim()

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Enter the email address associated with your JyotiAI account.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error || 'We could not start password recovery. Please try again.'
        )
      }

      setSent(true)
    } catch (resetError: unknown) {
      console.error('Password reset error:', resetError)

      setError(
        resetError instanceof Error
          ? resetError.message
          : 'We could not start password recovery. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#02080b] text-[#fff7e8]">
      <header className="border-b border-[#d7aa57]/16 bg-[#02080b]/95">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7aa57]/25 bg-[#061014]">
              <SolarJyotiMark className="h-7 w-7 text-[#f1c979]" />
            </span>

            <div>
              <div className="font-heading text-xl">JyotiAI</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#a9b3af]">
                Personal Vedic Intelligence
              </div>
            </div>
          </Link>

          <Link
            href="/login"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.18em] text-[#b9c2bf] hover:bg-white/5 hover:text-[#f1c979]"
          >
            <ArrowLeft className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1200px] items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg rounded-[30px] border border-[#d7aa57]/24 bg-[#061119]/92 p-2 shadow-[0_35px_110px_rgba(0,0,0,.55)]">
          <div className="rounded-[24px] border border-white/[0.055] bg-[#07131a]/82 p-7 md:p-9">
            {sent ? (
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#78aaa8]/30 bg-[#78aaa8]/10">
                  <CheckCircle2 className="h-7 w-7 text-[#8cc0bd]" />
                </div>

                <h1 className="mt-6 font-heading text-3xl">
                  Check your email
                </h1>

                <p className="mt-3 text-sm leading-7 text-[#aab5b2]">
                  If an account can receive password recovery at that address,
                  secure reset instructions will be sent by email.
                </p>

                <Link
                  href="/login"
                  className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#ef982f] px-6 font-semibold text-[#081017] hover:bg-[#ffad4f]"
                >
                  Return to sign in
                </Link>
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#efaa4f]/25 bg-[#efaa4f]/[0.07]">
                  <KeyRound className="h-5 w-5 text-[#efaa4f]" />
                </div>

                <h1 className="mt-6 font-heading text-4xl">
                  Reset your password
                </h1>

                <p className="mt-3 text-sm leading-7 text-[#aab5b2]">
                  Enter the email address you use for JyotiAI to begin secure
                  password recovery.
                </p>

                <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="mb-2 block text-sm text-[#d8dfdc]"
                    >
                      Email address
                    </label>

                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="min-h-12 w-full rounded-xl border border-[#d7aa57]/35 bg-[#020a0e] px-4 text-[#fff7e8] outline-none placeholder:text-[#66736f] focus:border-[#efaa4f]"
                    />
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm text-red-200"
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-12 w-full rounded-xl bg-[#ef982f] px-5 font-semibold text-[#081017] transition hover:bg-[#ffad4f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Sending recovery email…' : 'Send recovery email'}
                  </button>
                </form>

                <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#778580]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a99565]" />
                  For privacy, JyotiAI does not confirm whether an account
                  exists for the email entered here.
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
