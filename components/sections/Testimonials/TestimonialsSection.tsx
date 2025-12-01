"use client";

import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialItem {
  author: TestimonialAuthor;
  text: string;
  href?: string;
}

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: TestimonialItem[];
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section
      className={cn(
        "bg-black text-white",
        "py-16 sm:py-24 md:py-32 px-0",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:gap-12">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-6">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-neutral-400 sm:text-xl">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(2)].map((_, setIndex) =>
                testimonials.map((testimonial, i) => (
                  <TestimonialCard
                    key={`${setIndex}-${i}`}
                    author={testimonial.author}
                    text={testimonial.text}
                    href={testimonial.href}
                  />
                ))
              )}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-black sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-black sm:block" />
        </div>
      </div>
    </section>
  );
}

export type { TestimonialsSectionProps, TestimonialItem };
