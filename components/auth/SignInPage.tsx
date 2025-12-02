"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
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
  <div className="rounded-2xl border border-white/10 bg-white/5 dark:bg-zinc-900/40 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={`flex items-start gap-3 rounded-3xl bg-black/40 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-5 w-64 ${delay}`}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-2xl"
      alt={testimonial.name}
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-xs text-zinc-400">{testimonial.handle}</p>
      <p className="mt-1 text-zinc-100/90">{testimonial.text}</p>
    </div>
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span className="font-light tracking-tight text-zinc-100">
      Welcome back to <span className="font-semibold">JyotiAI</span>
    </span>
  ),
  description = "Sign in to continue your journey with the Cosmic Guru.",
  heroImageSrc,
  testimonials = [],
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
  
  // Clear error when user starts typing
  React.useEffect(() => {
    if (error && onClearError) {
      const timer = setTimeout(() => {
        onClearError();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  return (
    <div className="flex flex-col md:flex-row w-full">
      <section className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md glass-card border border-white/10 bg-black/40 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-white">
              {title}
            </h1>
            <p className="text-sm text-zinc-300">{description}</p>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                onSignIn?.(e);
              }}
            >
              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Email Address
                </label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-zinc-100 placeholder:text-zinc-500"
                    required
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300">
                  Password
                </label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-zinc-100 placeholder:text-zinc-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-zinc-400 hover:text-zinc-100 transition-colors" />
                      ) : (
                        <Eye className="w-5 h-5 text-zinc-400 hover:text-zinc-100 transition-colors" />
                      )}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="accent-violet-500"
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  onClick={() => onResetPassword?.()}
                  className="text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Reset password
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-button rounded-[11px] py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-white/10" />
              <span className="px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400 bg-black/60 rounded-full">
                Or continue with
              </span>
            </div>

            <div className="space-y-3">
              {onGoogleSignIn && (
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  disabled={loading || magicLinkLoading}
                  className="w-full flex items-center justify-center gap-3 border border-white/15 rounded-2xl py-3 hover:bg-white/5 transition-colors text-sm text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              )}

              {onFacebookSignIn && (
                <button
                  type="button"
                  onClick={onFacebookSignIn}
                  disabled={loading || magicLinkLoading}
                  className="w-full flex items-center justify-center gap-3 border border-white/15 rounded-2xl py-3 hover:bg-white/5 transition-colors text-sm text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Continue with Facebook
                </button>
              )}

              {onMagicLink && (
                <>
                  {!showMagicLink ? (
                    <button
                      type="button"
                      onClick={() => setShowMagicLink(true)}
                      disabled={loading || magicLinkLoading}
                      className="w-full flex items-center justify-center gap-3 border border-white/15 rounded-2xl py-3 hover:bg-white/5 transition-colors text-sm text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {mode === 'login' ? 'Sign in with Magic Link' : 'Sign up with Magic Link'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <GlassInputWrapper>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={magicLinkEmail}
                          onChange={(e) => setMagicLinkEmail(e.target.value)}
                          className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-zinc-100 placeholder:text-zinc-500"
                          disabled={magicLinkLoading}
                        />
                      </GlassInputWrapper>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!magicLinkEmail || !magicLinkEmail.includes('@')) {
                              return;
                            }
                            setMagicLinkLoading(true);
                            try {
                              await onMagicLink(magicLinkEmail);
                            } finally {
                              setMagicLinkLoading(false);
                            }
                          }}
                          disabled={magicLinkLoading || !magicLinkEmail || !magicLinkEmail.includes('@')}
                          className="flex-1 gradient-button rounded-[11px] py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {magicLinkLoading ? 'Sending...' : 'Send Magic Link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMagicLink(false);
                            setMagicLinkEmail('');
                          }}
                          disabled={magicLinkLoading}
                          className="px-4 border border-white/15 rounded-2xl py-3 hover:bg-white/5 transition-colors text-sm text-zinc-100 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <p className="text-center text-xs text-zinc-400">
              New to JyotiAI?{" "}
              <button
                type="button"
                onClick={() => onCreateAccount?.()}
                className="text-violet-400 hover:text-violet-300 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </section>

      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-6">
          <div
            className="absolute inset-4 rounded-3xl bg-cover bg-center shadow-[0_0_60px_rgba(56,189,248,0.5)]"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard
                testimonial={testimonials[0]}
                delay="animate-delay-100"
              />
              {testimonials[1] && (
                <div className="hidden xl:flex">
                  <TestimonialCard
                    testimonial={testimonials[1]}
                    delay="animate-delay-200"
                  />
                </div>
              )}
              {testimonials[2] && (
                <div className="hidden 2xl:flex">
                  <TestimonialCard
                    testimonial={testimonials[2]}
                    delay="animate-delay-300"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

