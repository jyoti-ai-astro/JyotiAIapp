'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowLeft,
  CircleDot,
  Orbit,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark'
import { SignInPage } from '@/components/auth/SignInPage'

const CelestialV3Scene = dynamic(
  () => import('@/app/dev/visual-v3/CelestialV3Scene'),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#02080b]" />
    ),
  }
)

interface AuthLayoutProps {
  mode?: 'login' | 'signup'
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
  onGoogleSignIn?: () => void
  onFacebookSignIn?: () => void
  onMagicLink?: (email: string) => void
  onResetPassword?: () => void
  onCreateAccount?: () => void
  error?: string | null
  onClearError?: () => void
}

export default function AuthLayout({
  mode = 'login',
  onSubmit,
  onGoogleSignIn,
  onFacebookSignIn,
  onMagicLink,
  onResetPassword,
  onCreateAccount,
  error,
  onClearError,
}: AuthLayoutProps) {
  const isLogin = mode === 'login'

  /*
   * We deliberately reuse the production V3 celestial engine.
   *
   * Login sits near the opening state of the JyotiAI universe.
   * Signup advances slightly deeper into the system — visually suggesting
   * that a new personal celestial model is beginning to form.
   */
  const sceneProgress = isLogin ? 0.035 : 0.105

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02080b] text-[#fff7e8]">
      {/* ------------------------------------------------------------------
          V3 CELESTIAL WORLD
         ------------------------------------------------------------------ */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <CelestialV3Scene
          progress={sceneProgress}
          extensionProgress={0}
          extensionActive={false}
        />
      </div>

      {/* Dark cinematic control layer — keeps forms readable without
          destroying the celestial world underneath. */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `
            radial-gradient(
              circle at 74% 46%,
              rgba(2,8,11,0.20) 0%,
              rgba(2,8,11,0.54) 34%,
              rgba(2,8,11,0.80) 74%,
              rgba(2,8,11,0.91) 100%
            ),
            linear-gradient(
              90deg,
              rgba(2,8,11,0.48) 0%,
              rgba(2,8,11,0.31) 43%,
              rgba(2,8,11,0.67) 71%,
              rgba(2,8,11,0.88) 100%
            )
          `,
        }}
      />

      {/* Fine celestial horizon / grain treatment. */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.22]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(255,247,232,.24) 0.55px, transparent 0.7px)',
          backgroundSize: '5px 5px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 18%, black 76%, transparent 100%)',
        }}
      />

      {/* ------------------------------------------------------------------
          MINIMAL AUTH HEADER
         ------------------------------------------------------------------ */}
      <header className="relative z-20 border-b border-[#d7aa57]/16 bg-[#02080b]/42 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d7aa57]/25 bg-[#061014]/70">
              <SolarJyotiMark className="h-7 w-7 text-[#f1c979]" />
            </span>

            <div>
              <div className="font-heading text-xl text-[#fff7e8]">
                JyotiAI
              </div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-[#a9b3af]">
                Personal Vedic Intelligence
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs uppercase tracking-[0.18em] text-[#b9c2bf] transition hover:bg-white/5 hover:text-[#f1c979]"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------------------------
          AUTH EXPERIENCE
         ------------------------------------------------------------------ */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1500px] items-center gap-10 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-10 lg:py-14">

        {/* Celestial journey narrative */}
        <section className="hidden min-w-0 lg:block">
          <div className="max-w-[690px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7aa57]/28 bg-[#050c10]/62 px-4 py-2 backdrop-blur-md">
              {isLogin ? (
                <Orbit className="h-4 w-4 text-[#f1c979]" />
              ) : (
                <Sparkles className="h-4 w-4 text-[#f1c979]" />
              )}

              <span className="text-[11px] uppercase tracking-[0.21em] text-[#efc56e]">
                {isLogin
                  ? 'Return to your celestial model'
                  : 'Your celestial journey begins here'}
              </span>
            </div>

            <h1 className="max-w-[680px] font-heading text-[clamp(3.25rem,5vw,5.9rem)] leading-[0.94] tracking-[-0.035em] text-[#fff7e8]">
              {isLogin ? (
                <>
                  Return to the universe
                  <span className="block text-[#e8a346]">
                    built from your chart.
                  </span>
                </>
              ) : (
                <>
                  One birth chart.
                  <span className="block text-[#e8a346]">
                    A lifetime of context.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-7 max-w-[590px] text-base leading-8 text-[#bcc5c1]">
              {isLogin
                ? 'Your Kundali, Jyoti Guru conversations, predictions, timing and reports remain connected to the same verified celestial identity.'
                : 'Begin with your verified birth details. JyotiAI will transform them into the personal celestial model that connects Kundali, Guru, timing and every experience that follows.'}
            </p>

            <div className="mt-9 grid max-w-[620px] gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d7aa57]/16 bg-[#041016]/58 p-4 backdrop-blur-md">
                <CircleDot className="h-5 w-5 text-[#efb154]" />
                <div className="mt-3 text-sm text-[#fff7e8]">
                  Verified birth chart
                </div>
                <div className="mt-1 text-xs leading-5 text-[#83908b]">
                  Your permanent celestial foundation
                </div>
              </div>

              <div className="rounded-2xl border border-[#d7aa57]/16 bg-[#041016]/58 p-4 backdrop-blur-md">
                <Orbit className="h-5 w-5 text-[#efb154]" />
                <div className="mt-3 text-sm text-[#fff7e8]">
                  Living timing
                </div>
                <div className="mt-1 text-xs leading-5 text-[#83908b]">
                  Dashas, transits and future cycles
                </div>
              </div>

              <div className="rounded-2xl border border-[#d7aa57]/16 bg-[#041016]/58 p-4 backdrop-blur-md">
                <Sparkles className="h-5 w-5 text-[#efb154]" />
                <div className="mt-3 text-sm text-[#fff7e8]">
                  Jyoti Guru
                </div>
                <div className="mt-1 text-xs leading-5 text-[#83908b]">
                  Guidance with your chart in context
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication card */}
        <section className="mx-auto w-full max-w-[520px]">
          <div className="rounded-[30px] border border-[#d7aa57]/24 bg-[#061119]/88 p-2 shadow-[0_35px_110px_rgba(0,0,0,.55)] backdrop-blur-2xl">
            <div className="rounded-[24px] border border-white/[0.055] bg-[#07131a]/76">
              <SignInPage
                mode={mode}
                title={
                  isLogin ? (
                    <>
                      Welcome back to{' '}
                      <span className="text-[#efb154]">JyotiAI</span>
                    </>
                  ) : (
                    <>
                      Begin your{' '}
                      <span className="text-[#efb154]">JyotiAI</span> journey
                    </>
                  )
                }
                description={
                  isLogin
                    ? 'Continue with your saved celestial profile.'
                    : 'Create your account. Your verified birth chart comes next.'
                }
                onSignIn={onSubmit}
                onGoogleSignIn={onGoogleSignIn}
                onFacebookSignIn={onFacebookSignIn}
                onMagicLink={onMagicLink}
                onResetPassword={onResetPassword}
                onCreateAccount={onCreateAccount}
                error={error}
                onClearError={onClearError}
              />
            </div>

            <div className="flex items-center justify-center gap-2 px-5 py-4 text-[11px] text-[#778580]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a99565]" />
              Secure account access · Your personal data remains private
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
