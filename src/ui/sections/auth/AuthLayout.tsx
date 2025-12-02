'use client';

import React from 'react';
import { SignInPage } from '@/components/auth/SignInPage';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  mode: 'login' | 'signup';
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

export default function AuthLayout({
  mode,
  onSubmit,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}: AuthLayoutProps) {
  const isLogin = mode === 'login';

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
          heroImageSrc={
            isLogin
              ? '/images/jyotai-login-hero.jpg'
              : '/images/jyotai-signup-hero.jpg'
          }
          onSignIn={onSubmit}
          onGoogleSignIn={onGoogleSignIn}
          onResetPassword={onResetPassword}
          onCreateAccount={onCreateAccount}
        />
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

