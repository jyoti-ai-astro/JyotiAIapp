'use client';

import React, { useState } from 'react';
import { SignInPage } from '@/components/auth/SignInPage';
import { Shield } from 'lucide-react';
import { SolarJyotiMark } from '@/src/ui/brand/SolarJyotiMark';

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
    <section className="relative flex min-h-[calc(100vh-120px)] items-center justify-center overflow-hidden bg-[#07131F] px-4 py-10 text-[#FFF7E8] md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_12%,rgba(242,140,40,0.18),transparent_24rem),radial-gradient(circle_at_12%_28%,rgba(47,125,126,0.16),transparent_22rem)]" />
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D8B56A]/12" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3 rounded-full border border-[#D8B56A]/25 bg-[#FFF8E6]/8 px-4 py-2">
            <SolarJyotiMark className="h-6 w-6 text-[#FFF7E8]" />
            <span className="font-heading text-lg text-[#FFF7E8]">JyotiAI</span>
          </div>
        </div>
        <SignInPage
          title={
            isLogin ? (
              <span className="font-light tracking-tight text-[#FFF7E8]">
                Welcome back to{' '}
                <span className="font-semibold text-[#F1C979]">
                  JyotiAI
                </span>
              </span>
            ) : (
              <span className="font-light tracking-tight text-[#FFF7E8]">
                Join{' '}
                <span className="font-semibold text-[#F1C979]">
                  JyotiAI
                </span>
              </span>
            )
          }
          description={
            isLogin
              ? 'Sign in to continue with your saved Kundali, Guru, reports, and guidance.'
              : 'Create your account to begin with a verified birth profile and first Kundali.'
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
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#B9C2BF]">
          <Shield className="w-3 h-3" />
          <span>
            Your data is encrypted and never sold. Built with love in India.
          </span>
        </p>
      </div>
    </section>
  );
}
