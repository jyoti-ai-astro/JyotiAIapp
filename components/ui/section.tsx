'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  contained?: boolean;
}

export function Section({
  eyebrow,
  title,
  description,
  actions,
  contained = true,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('py-12 md:py-16', className)} {...props}>
      <div className={cn(contained && 'page-container')}>
        {(eyebrow || title || description || actions) && (
          <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {eyebrow && (
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-saffron">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2 className="font-heading text-3xl font-semibold leading-tight text-primary md:text-4xl">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
