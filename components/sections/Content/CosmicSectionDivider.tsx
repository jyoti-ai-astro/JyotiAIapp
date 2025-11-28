/**
 * Cosmic Section Divider Component
 * 
 * Phase 3 — Section 22: PAGES PHASE 7 (F22)
 * 
 * Mandala ring divider with rotating animation and cosmic dust
 */

'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useGlobalProgress } from '@/hooks/use-global-progress';

export interface CosmicSectionDividerProps {
  /** Additional className */
  className?: string;
}

export function CosmicSectionDivider({ className = '' }: CosmicSectionDividerProps) {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const dividerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(dividerRef, { once: true, margin: '-50px' });
  
  // Section motion tracking with scroll features
  const sectionId = 'section-divider';
  const { sectionRef, smoothedProgress, scrollDirection, scrollVelocity } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator?.onSectionEnter?.(sectionId);
    },
    onExit: () => {
      orchestrator?.onSectionExit?.(sectionId);
    },
    onProgress: (progress) => {
      orchestrator?.dividerReveal?.(progress);
      orchestrator?.scrollGlow?.(sectionId, progress);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (dividerRef.current) {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = dividerRef.current;
    }
  }, [dividerRef, sectionRef]);
  
  // Scroll-based divider reveal with mandala rotation
  useEffect(() => {
    if (!dividerRef.current) return;
    
    const mandalaElement = dividerRef.current.querySelector('[data-mandala-ring]');
    if (mandalaElement) {
      const revealTrigger = scrollDividerReveal(mandalaElement, {
        start: 'top center',
        end: 'bottom center',
      });
      
      return () => {
        revealTrigger.kill();
      };
    }
  }, []);
  
  // Fading cosmic dust particles
  const dustParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) % 360,
    radius: 40 + (i % 3) * 20,
    delay: i * 0.1,
  }));
  
  return (
    <motion.div
      ref={dividerRef}
      id={sectionId}
      data-section-id={sectionId}
      className={`relative py-16 flex items-center justify-center ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? {} : { opacity: 0 }}
      style={isInView ? { opacity: globalProgress } : undefined}
      transition={{ duration: 1 }}
    >
      {/* Mandala Ring (rotates 0.05°/sec = 7200s full rotation) */}
      <motion.div
        className="relative w-32 h-32 md:w-48 md:h-48"
        data-mandala-ring
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 7200, // 0.05deg/sec = 7200 seconds
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute inset-0 border-2 border-gold/30 rounded-full" />
        <div className="absolute inset-4 border border-aura-blue/20 rounded-full" />
        <div className="absolute inset-8 border border-gold/10 rounded-full" />
      </motion.div>
      
      {/* Fading Cosmic Dust */}
      <div className="absolute inset-0 pointer-events-none">
        {dustParticles.map((particle) => {
          const x = Math.cos((particle.angle * Math.PI) / 180) * particle.radius;
          const y = Math.sin((particle.angle * Math.PI) / 180) * particle.radius;
          
          return (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full bg-gold/30"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: particle.delay,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>
      
      {/* Golden Shimmer Line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
        style={{
          top: '50%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 0%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
}

