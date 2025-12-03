'use client';

import React, { useState } from 'react';
import { SignInPage } from '@/components/auth/SignInPage';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  mode: 'login' | 'signup';
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onFacebookSignIn?: () => void;
  onMagicLink?: (email: string) => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  error?: string | null;
  onClearError?: () => void;
}

export default function AuthLayout({
  mode,
  onSubmit,
  onGoogleSignIn,
  onFacebookSignIn,
  onMagicLink,
  onResetPassword,
  onCreateAccount,
  error,
  onClearError,
}: AuthLayoutProps) {
  const isLogin = mode === 'login';
  const [loading, setLoading] = useState(false);

  return (
    <section className="page-container flex items-center justify-center min-h-[calc(100vh-120px)] py-10 md:py-16">
      <div className="w-full max-w-5xl">
        <SignInPage
          title={
            isLogin ? (
              <span className="font-light tracking-tight text-zinc-100">
                Welcome back to{' '}
                <span className="font-semibold bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
                  JyotiAI
                </span>
              </span>
            ) : (
              <span className="font-light tracking-tight text-zinc-100">
                Join{' '}
                <span className="font-semibold bg-gradient-to-r from-[#FFD57A] to-[#FFB347] bg-clip-text text-transparent">
                  JyotiAI
                </span>
              </span>
            )
          }
          description={
            isLogin
              ? 'Sign in to continue your journey with The Guru.'
              : 'Create your account to start asking cosmic questions.'
          }
          heroImageSrc={undefined}
          onSignIn={async (e) => {
            setLoading(true);
            try {
              await onSubmit(e);
            } catch (error) {
              // Error handling is done in the page component
            } finally {
              setLoading(false);
            }
          }}
          onGoogleSignIn={async () => {
            setLoading(true);
            try {
              await onGoogleSignIn?.();
            } catch (error) {
              // Error handling is done in the page component
            } finally {
              setLoading(false);
            }
          }}
          onFacebookSignIn={async () => {
            setLoading(true);
            try {
              await onFacebookSignIn?.();
            } catch (error) {
              // Error handling is done in the page component
            } finally {
              setLoading(false);
            }
          }}
          onMagicLink={async (email: string) => {
            setLoading(true);
            try {
              await onMagicLink?.(email);
            } catch (error) {
              // Error handling is done in the page component
            } finally {
              setLoading(false);
            }
          }}
          onResetPassword={onResetPassword}
          onCreateAccount={onCreateAccount}
          loading={loading}
          error={error}
          onClearError={onClearError}
          mode={mode}
        />
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="text-red-400 hover:text-red-300 ml-2"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}
        <p className="mt-6 text-center text-xs text-white/60 flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          <span>
            Your data is encrypted and never sold. Built with love in India.
          </span>
        </p>
      </div>
    </section>
  );
}

