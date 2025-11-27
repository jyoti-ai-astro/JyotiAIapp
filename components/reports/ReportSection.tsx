/**
 * Report Section Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Generic reusable section with animations
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { scrollFadeIn, scrollDividerReveal } from '@/lib/motion/gsap-motion-bridge';

export interface ReportSectionProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
}

export const ReportSection = React.memo(function ReportSection({
  title,
  subtitle,
  icon,
  children,
  className = '',
}: ReportSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const { orchestrator } = useMotionOrchestrator();

  // Scroll animations
  useEffect(() => {
    if (sectionRef.current) {
      scrollFadeIn(sectionRef.current, {
        start: 'top 80%',
        end: 'top 20%',
      });
    }

    if (dividerRef.current) {
      scrollDividerReveal(dividerRef.current, {
        start: 'top 80%',
        end: 'top 20%',
      });
    }
  }, []);

  // Emit section event when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            orchestrator.emitSceneEvent('guru-report-section', { title });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [title, orchestrator]);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ 
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={`bg-cosmic/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 ${className}`}
    >
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h2 className="text-2xl font-display font-bold text-gold">
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-white/70 text-sm font-heading ml-8">
            {subtitle}
          </p>
        )}
      </div>

      {/* Golden Shimmer Divider */}
      <motion.div
        ref={dividerRef}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ 
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
        className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-6 md:mb-8 origin-center"
      />

      {/* Section Content */}
      <div className="text-white/80">
        {children}
      </div>
    </motion.section>
  );
});

