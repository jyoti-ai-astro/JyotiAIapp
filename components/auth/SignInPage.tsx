"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
  onMagicLink?: (email: string) => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  mode?: 'login' | 'signup';
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-[#D8B56A]/22 bg-[#FFF8E6]/8 backdrop-blur-sm transition-colors focus-within:border-[#F28C28]/80 focus-within:bg-[#FFF8E6]/12">
    {children}
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title,
  description,
  onSignIn,
  onGoogleSignIn,
  onFacebookSignIn,
  onMagicLink,
  onResetPassword,
  onCreateAccount,
  loading = false,
  error,
  onClearError,
  mode = 'login',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const isSignup = mode === 'signup';

  React.useEffect(() => {
    if (!error || !onClearError) return;
    const timer = setTimeout(onClearError, 5000);
    return () => clearTimeout(timer);
  }, [error, onClearError]);

  return (
    <div className="w-full">
      <section className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md rounded-lg border border-[#D8B56A]/24 bg-[#07131F]/76 p-8 shadow-[0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-3xl font-semibold leading-tight text-[#FFF7E8] md:text-4xl">{title}</h1>
            {description && <p className="text-sm leading-6 text-[#B9C2BF]">{description}</p>}

            {error && (
              <div role="alert" className="rounded-lg border border-red-400/30 bg-red-950/35 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSignIn?.(event); }}>
              <div>
                <label htmlFor="auth-email" className="text-xs font-medium text-[#B9C2BF]">Email Address</label>
                <GlassInputWrapper>
                  <input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="w-full rounded-lg bg-transparent p-4 text-sm text-[#FFF7E8] placeholder:text-[#B9C2BF]/50 focus:outline-none" required />
                </GlassInputWrapper>
              </div>

              <div>
                <label htmlFor="auth-password" className="text-xs font-medium text-[#B9C2BF]">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Create a password' : 'Enter your password'} className="w-full rounded-lg bg-transparent p-4 pr-12 text-sm text-[#FFF7E8] placeholder:text-[#B9C2BF]/50 focus:outline-none" required />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 flex items-center" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="h-5 w-5 text-[#B9C2BF]" /> : <Eye className="h-5 w-5 text-[#B9C2BF]" />}
                    </button>
                  </div>
                </GlassInputWrapper>
                {isSignup && <p className="mt-2 text-[11px] leading-5 text-[#7f8c87]">Use at least 6 characters. You can complete your birth profile after account creation.</p>}
              </div>

              {!isSignup && (
                <div className="flex items-center justify-between text-xs text-[#B9C2BF]">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" name="rememberMe" className="accent-[#F28C28]" />
                    <span>Keep me signed in</span>
                  </label>
                  <button type="button" onClick={() => onResetPassword?.()} className="text-[#F1C979] hover:text-[#FFF7E8] hover:underline">Reset password</button>
                </div>
              )}

              <button type="submit" disabled={loading} className="min-h-11 w-full rounded-lg bg-[#F28C28] py-3 text-sm font-semibold text-[#07131F] transition-colors hover:bg-[#F6A443] disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? (isSignup ? 'Creating account…' : 'Signing in…') : (isSignup ? 'Create account' : 'Sign in')}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-[#D8B56A]/18" />
              <span className="absolute rounded-full bg-[#07131F] px-3 text-[10px] uppercase tracking-[0.2em] text-[#B9C2BF]">Or continue with</span>
            </div>

            <div className="space-y-3 pt-1">
              {onGoogleSignIn && (
                <button type="button" onClick={onGoogleSignIn} disabled={loading || magicLinkLoading} className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#D8B56A]/22 py-3 text-sm text-[#FFF7E8] transition-colors hover:bg-[#FFF8E6]/8 disabled:opacity-50">
                  <span className="text-lg font-semibold">G</span> Continue with Google
                </button>
              )}
              {onFacebookSignIn && (
                <button type="button" onClick={onFacebookSignIn} disabled={loading || magicLinkLoading} className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-[#D8B56A]/22 py-3 text-sm text-[#FFF7E8] transition-colors hover:bg-[#FFF8E6]/8 disabled:opacity-50">
                  <span className="text-lg font-semibold">f</span> Continue with Facebook
                </button>
              )}
              {onMagicLink && !showMagicLink && (
                <button type="button" onClick={() => setShowMagicLink(true)} disabled={loading || magicLinkLoading} className="flex min-h-11 w-full items-center justify-center rounded-lg border border-[#D8B56A]/22 py-3 text-sm text-[#FFF7E8] transition-colors hover:bg-[#FFF8E6]/8 disabled:opacity-50">
                  {isSignup ? 'Sign up with Magic Link' : 'Sign in with Magic Link'}
                </button>
              )}
              {onMagicLink && showMagicLink && (
                <div className="space-y-2 rounded-xl border border-[#D8B56A]/18 bg-black/10 p-3">
                  <GlassInputWrapper>
                    <input type="email" placeholder="Enter your email" value={magicLinkEmail} onChange={(event) => setMagicLinkEmail(event.target.value)} className="w-full rounded-lg bg-transparent p-4 text-sm text-[#FFF7E8] placeholder:text-[#B9C2BF]/50 focus:outline-none" disabled={magicLinkLoading} />
                  </GlassInputWrapper>
                  <div className="flex gap-2">
                    <button type="button" onClick={async () => { if (!magicLinkEmail.includes('@')) return; setMagicLinkLoading(true); try { await onMagicLink(magicLinkEmail); } finally { setMagicLinkLoading(false); } }} disabled={magicLinkLoading || !magicLinkEmail.includes('@')} className="min-h-11 flex-1 rounded-lg bg-[#F28C28] px-4 text-sm font-semibold text-[#07131F] disabled:opacity-50">{magicLinkLoading ? 'Sending…' : 'Send Magic Link'}</button>
                    <button type="button" onClick={() => { setShowMagicLink(false); setMagicLinkEmail(''); }} disabled={magicLinkLoading} className="min-h-11 rounded-lg border border-[#D8B56A]/22 px-4 text-sm text-[#FFF7E8]">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-[#B9C2BF]">
              {isSignup ? 'Already have an account?' : 'New to JyotiAI?'}{' '}
              {isSignup ? (
                <a href="/login" className="text-[#F1C979] hover:text-[#FFF7E8] hover:underline">Sign in to JyotiAI</a>
              ) : (
                <button type="button" onClick={() => onCreateAccount?.()} className="text-[#F1C979] hover:text-[#FFF7E8] hover:underline">Create an account</button>
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
