'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

interface CompanyPageShellProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}

export default function CompanyPageShell({ eyebrow, title, description, children }: CompanyPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02080d] text-[#fff6df]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_78%_12%,rgba(255,152,45,0.14),transparent_30rem),radial-gradient(circle_at_18%_30%,rgba(76,137,136,0.08),transparent_28rem)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_center,rgba(255,246,223,.26)_0.55px,transparent_0.7px)] [background-size:6px_6px]"
      />

      <div className="page-container relative z-10 py-14 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren(0.1)}
          className="mb-14 space-y-6 text-center md:mb-20"
        >
          {eyebrow && (
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b75f]/30 bg-[#d9b75f]/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e7c772]">
                {eyebrow}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="space-y-5">
            <h1 className="mx-auto max-w-5xl font-heading text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-[#fff6df] md:text-6xl lg:text-7xl">
              {title}
            </h1>
            {description && (
              <p className="mx-auto max-w-3xl text-base leading-8 text-[#aab5b2] md:text-xl">
                {description}
              </p>
            )}
          </motion.div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-12">
          {children}
        </motion.div>
      </div>
    </main>
  );
}
