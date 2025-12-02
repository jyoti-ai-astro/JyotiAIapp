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

export default function CompanyPageShell({
  eyebrow,
  title,
  description,
  children,
}: CompanyPageShellProps) {
  return (
    <div className="page-container py-10 md:py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerChildren(0.1)}
        className="text-center space-y-6 mb-12 md:mb-16"
      >
        {eyebrow && (
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD57A]/10 border border-[#FFD57A]/30 text-sm font-medium text-[#FFD57A]">
              {eyebrow}
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="space-y-12"
      >
        {children}
      </motion.div>
    </div>
  );
}

