"use client";

import React, { useState } from "react";
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
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
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
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-full bg-gradient-to-br from-black via-slate-950 to-indigo-950">
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
                className="w-full gradient-button rounded-[11px] py-3 text-sm font-semibold"
              >
                Sign in
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-white/10" />
              <span className="px-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400 bg-black/60 rounded-full">
                Or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-white/15 rounded-2xl py-3 hover:bg-white/5 transition-colors text-sm text-zinc-100"
            >
              <span className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-xs">
                G
              </span>
              Continue with Google
            </button>

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

