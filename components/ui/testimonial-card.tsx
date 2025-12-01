"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface TestimonialAuthor {
  name: string;
  role?: string;
  location?: string;
  avatarUrl?: string;
}

interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  author,
  text,
  href,
  className,
}) => {
  const CardWrapper = href ? Link : "div";

  return (
    <CardWrapper
      href={href as any}
      className={cn(
        "flex w-[260px] sm:w-[320px] flex-col rounded-2xl border border-white/5 bg-white/5 px-4 py-4 sm:px-5 sm:py-5",
        "backdrop-blur-xl shadow-[0_0_30px_rgba(56,189,248,0.35)]",
        "transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(129,140,248,0.65)]",
        href && "cursor-pointer",
        className
      )}
    >
      <p className="text-sm sm:text-[15px] text-neutral-100 text-left">
        "{text}"
      </p>
      <div className="mt-4 flex items-center gap-3">
        {author.avatarUrl ? (
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full border border-white/20">
            <img
              src={author.avatarUrl}
              alt={author.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-9 w-9 flex-shrink-0 rounded-full bg-cyan-500/20 text-xs flex items-center justify-center border border-cyan-500/40">
            {author.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-white">
            {author.name}
          </span>
          {(author.role || author.location) && (
            <span className="text-[11px] uppercase tracking-wide text-neutral-400">
              {author.role}
              {author.role && author.location && " • "}
              {author.location}
            </span>
          )}
        </div>
      </div>
    </CardWrapper>
  );
};

