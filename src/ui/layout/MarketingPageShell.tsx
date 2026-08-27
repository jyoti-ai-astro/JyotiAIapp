'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

interface MarketingPageShellProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}

export default function MarketingPageShell({
  eyebrow,
  title,
  description,
  children,
}: MarketingPageShellProps) {
  return (
    <div className="page-container py-10 md:py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.1)}
        className="space-y-8 mb-12 md:mb-16"
      >
        {eyebrow && (
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A24A]/35 bg-[#F28C28]/12 px-4 py-2 text-sm font-medium text-primary">
              {eyebrow}
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="space-y-4">
          <h1 className="font-heading text-4xl font-semibold leading-tight text-primary md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {description}
            </p>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="space-y-8"
      >
        {children}
      </motion.div>
    </div>
  );
}
