'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion';

interface DashboardShellProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  rightActions?: React.ReactNode;
}

export default function DashboardShell({
  title,
  subtitle,
  children,
  rightActions,
}: DashboardShellProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={title ? staggerChildren(0.1) : fadeUp}
      className="py-6 md:py-10"
    >
      {(title || rightActions) && (
        <motion.div
          variants={fadeUp}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6"
        >
          <div className="space-y-2">
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-white/70 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {rightActions && (
            <div className="flex-shrink-0">{rightActions}</div>
          )}
        </motion.div>
      )}

      <motion.div
        variants={fadeUp}
        className="mt-4 md:mt-6 grid gap-6 md:gap-8"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

