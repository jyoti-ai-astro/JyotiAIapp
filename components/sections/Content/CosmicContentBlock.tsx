/**
 * Cosmic Content Block Component
 * 
 * Phase 3 — Section 22: PAGES PHASE 7 (F22)
 * 
 * Individual content block with parallax, animations, and layout patterns
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useSectionMotion } from '@/hooks/motion/useSectionMotion';
import { useScrollMotion } from '@/hooks/motion/useScrollMotion';
import { scrollParallaxY } from '@/lib/motion/gsap-motion-bridge';

export interface CosmicContentBlockProps {
  /** Layout pattern */
  layout?: 'left-text-right-image' | 'right-text-left-image' | 'full-width';
  
  /** Title */
  title: string;
  
  /** Subtitle */
  subtitle?: string;
  
  /** Content paragraphs */
  content: string[];
  
  /** Image source */
  image?: string;
  
  /** Image alt text */
  imageAlt?: string;
  
  /** Additional className */
  className?: string;
  
  /** Animation delay */
  delay?: number;
}

export function CosmicContentBlock({
  layout = 'left-text-right-image',
  title,
  subtitle,
  content,
  image,
  imageAlt,
  className = '',
  delay = 0,
}: CosmicContentBlockProps) {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const blockRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(blockRef, { once: true, margin: '-100px' });
  
  // Section motion tracking with scroll features
  const sectionId = `content-${title.toLowerCase().replace(/\s+/g, '-')}`;
  const { sectionRef, smoothedProgress, scrollDirection, scrollVelocity } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator.onSectionEnter(sectionId);
      // Emit scene event for content enter (Phase 12 - F27)
      orchestrator.emitSceneEvent('content-enter', { sectionId });
      // Trigger blessing wave for About page divinity section (Phase 13 - F28)
      if (sectionId.includes('divinity') || sectionId.includes('about')) {
        orchestrator.triggerBlessingWave(0.5);
      }
    },
    onExit: () => {
      orchestrator.onSectionExit(sectionId);
      // Emit scene event for content exit (Phase 12 - F27)
      orchestrator.emitSceneEvent('content-exit', { sectionId });
    },
    onProgress: (progress) => {
      orchestrator.contentFade(progress, sectionId);
      orchestrator.scrollParallax(sectionId, progress);
      orchestrator.scrollReveal(sectionId, progress);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (blockRef.current) {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = blockRef.current;
    }
  }, [blockRef, sectionRef]);
  
  // Scroll-based parallax for text and images
  useEffect(() => {
    if (!blockRef.current) return;
    
    const textElements = blockRef.current.querySelectorAll('[data-content-text]');
    const imageElements = blockRef.current.querySelectorAll('[data-content-image]');
    
    const textTriggers = Array.from(textElements).map((el) =>
      scrollParallaxY(el, 0.2, { start: 'top bottom', end: 'bottom top' })
    );
    
    const imageTriggers = Array.from(imageElements).map((el) =>
      scrollParallaxY(el, 0.4, { start: 'top bottom', end: 'bottom top' })
    );
    
    return () => {
      textTriggers.forEach((trigger) => trigger.kill());
      imageTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);
  
  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ['start end', 'end start'],
  });
  
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  
  // Floating cosmic dust particles
  const dustParticles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: (i * 12.5) % 100,
    y: (i * 10) % 100,
    delay: i * 0.2,
    duration: 4 + (i % 3),
  }));
  
  // Layout classes
  const layoutClasses = {
    'left-text-right-image': 'grid-cols-1 md:grid-cols-2 gap-8 md:gap-12',
    'right-text-left-image': 'grid-cols-1 md:grid-cols-2 gap-8 md:gap-12',
    'full-width': 'grid-cols-1',
  };
  
  const textOrder = layout === 'right-text-left-image' ? 'md:order-2' : 'md:order-1';
  const imageOrder = layout === 'right-text-left-image' ? 'md:order-1' : 'md:order-2';
  
  return (
    <motion.section
      ref={blockRef}
      id={sectionId}
      data-section-id={sectionId}
      className={`relative py-16 md:py-24 px-4 ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: globalProgress } : { opacity: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      {/* Floating Cosmic Dust Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {dustParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-gold/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, 15, -10, 0],
              y: [0, -20, -5, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      <div className={`container mx-auto grid ${layoutClasses[layout]}`}>
        {/* Text Content */}
        <motion.div
          className={`space-y-6 ${textOrder}`}
          style={{ y: textY }}
          data-content-text
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: globalProgress, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xl md:text-2xl text-gold font-heading">
                {subtitle}
              </p>
            )}
          </motion.div>
          
          <div className="space-y-4">
            {content.map((paragraph, i) => (
              <motion.p
                key={i}
                className="text-white/80 text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: globalProgress, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: delay + 0.4 + i * 0.1 }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </motion.div>
        
        {/* Image Content */}
        {image && layout !== 'full-width' && (
          <motion.div
            className={`relative ${imageOrder}`}
            style={{ y: imageY }}
            data-content-image
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: globalProgress, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
          >
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-gold/20">
              <Image
                src={image}
                alt={imageAlt || title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gold shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        )}
        
        {/* Full-width image */}
        {image && layout === 'full-width' && (
          <motion.div
            className="relative mt-8"
            style={{ y: imageY }}
            data-content-image
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: globalProgress, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: delay + 0.5 }}
          >
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-gold/20">
              <Image
                src={image}
                alt={imageAlt || title}
                fill
                className="object-cover"
                sizes="100vw"
              />
              {/* Gold shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

