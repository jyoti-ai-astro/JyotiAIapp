'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerChildren } from '@/src/ui/theme/global-motion'

interface CompanyPageShellProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  children: React.ReactNode
}

export default function CompanyPageShell({
  eyebrow,
  title,
  description,
  children,
}: CompanyPageShellProps) {
  return (
    <>
      <div
        data-company-celestial-shell="true"
        className="relative min-h-[70vh] overflow-hidden bg-[#030b10] text-[#fff6df]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_4%,rgba(239,152,47,0.10),transparent_30rem),radial-gradient(circle_at_12%_16%,rgba(57,126,128,0.08),transparent_28rem)]"
        />

        <div className="page-container relative py-12 md:py-16">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren(0.1)}
            className="mb-12 space-y-6 text-center md:mb-16"
          >
            {eyebrow && (
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b75f]/30 bg-[#efaa4f]/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7c772]">
                  {eyebrow}
                </div>
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="space-y-4">
              <h1 className="mx-auto max-w-5xl font-heading text-4xl font-medium leading-[1.05] text-[#fff6df] md:text-5xl lg:text-6xl">
                {title}
              </h1>

              {description && (
                <p className="mx-auto max-w-3xl text-base leading-7 text-[#aab5b2] md:text-lg md:leading-8">
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
      </div>

      <style jsx global>{`
        /*
         * P4.8A4 — one shared Company/public-shell header contract.
         * About, Contact, Blog, Status and other CompanyPageShell consumers
         * inherit one deterministic dark public header.
         */
        body:has([data-company-celestial-shell='true']) header {
          background: rgba(3, 11, 16, 0.97) !important;
          border-bottom-color: rgba(217, 183, 95, 0.22) !important;
          color: #fff7e8 !important;
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.18) !important;
          backdrop-filter: blur(18px) !important;
          -webkit-backdrop-filter: blur(18px) !important;
        }

        body:has([data-company-celestial-shell='true'])
          header
          a:not([class*='bg-orange']):not([class*='bg-[#ef']):not([class*='bg-[#ff']),
        body:has([data-company-celestial-shell='true'])
          header
          button:not([class*='bg-orange']):not([class*='bg-[#ef']):not([class*='bg-[#ff']) {
          color: #d8dfdc !important;
        }

        body:has([data-company-celestial-shell='true']) header a:hover,
        body:has([data-company-celestial-shell='true']) header button:hover {
          color: #fff7e8 !important;
        }

        body:has([data-company-celestial-shell='true']) header::before,
        body:has([data-company-celestial-shell='true']) header::after {
          opacity: 0 !important;
        }
      `}</style>
    </>
  )
}
