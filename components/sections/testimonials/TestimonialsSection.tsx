"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  TestimonialCard,
  type TestimonialAuthor,
} from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  // Duplicate the testimonials a few times for a smooth marquee loop
  const repeatedTestimonials = React.useMemo(
    () =>
      Array.from({ length: 4 }).flatMap((_, setIndex) =>
        testimonials.map((t, i) => ({
          key: `${setIndex}-${i}`,
          ...t,
        }))
      ),
    [testimonials]
  );

  return (
    <section
      className={cn(
        "bg-background text-foreground py-12 sm:py-24 md:py-32 px-0",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:gap-16">
        {/* Heading */}
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-semibold leading-tight sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-md max-w-[600px] font-medium text-muted-foreground sm:text-xl">
            {description}
          </p>
        </div>

        {/* Marquee */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex w-full overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] [--duration:40s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee group-hover:[animation-play-state:paused]">
              {repeatedTestimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.key}
                  author={testimonial.author}
                  text={testimonial.text}
                  href={testimonial.href}
                />
              ))}
            </div>
          </div>

          {/* Gradient fades on left/right for nicer edge cutoff */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-background sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-background sm:block" />
        </div>
      </div>
    </section>
  );
}

export type TestimonialItem = {
  author: TestimonialAuthor;
  text: string;
  href?: string;
};
