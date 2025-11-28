/**
 * Feature Card Component
 * 
 * Phase 3 — Section 21: PAGES PHASE 6 (F21)
 * 
 * Individual feature card with cosmic animations and real content
 */

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { useSectionMotion } from '@/hooks/motion/useSectionMotion';
import { useScrollMotion } from '@/hooks/motion/useScrollMotion';
import { scrollTilt, scrollGlowPulse } from '@/lib/motion/gsap-motion-bridge';

export interface FeatureCardData {
  id: string;
  title: string;
  subtitle: string;
  highlights: string[];
  icon: string;
  href: string;
  isPremium?: boolean;
  isLocked?: boolean;
}

export interface FeatureCardProps {
  feature: FeatureCardData;
  index: number;
  isInView: boolean;
  intensity?: number;
}

export function FeatureCard({ feature, index, isInView, intensity = 1.0 }: FeatureCardProps) {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Section motion tracking with scroll features
  const sectionId = `feature-${feature.id}`;
  const { sectionRef, smoothedProgress, scrollDirection, scrollVelocity } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator?.onSectionEnter?.(sectionId);
    },
    onExit: () => {
      orchestrator?.onSectionExit?.(sectionId);
    },
    onProgress: (progress) => {
      orchestrator?.cardTilt?.(progress, sectionId);
      orchestrator?.scrollParallax?.(sectionId, progress);
      orchestrator?.scrollGlow?.(sectionId, progress);
      orchestrator?.scrollDepthShift?.(sectionId, progress);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (cardRef.current) {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = cardRef.current;
    }
  }, [cardRef, sectionRef]);
  
  // Scroll-based tilt and glow animations
  useEffect(() => {
    if (!cardRef.current) return;
    
    const tiltTrigger = scrollTilt(cardRef.current, 4, {
      start: 'top center',
      end: 'bottom center',
    });
    
    const glowTrigger = scrollGlowPulse(cardRef.current, {
      start: 'top center',
      end: 'bottom center',
    });
    
    return () => {
      tiltTrigger.kill();
      glowTrigger.kill();
    };
  }, []);
  
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  
  // Parallax tilt (2-4 degrees)
  const tiltX = useTransform(springY, [-50, 50], [-4, 4]);
  const tiltY = useTransform(springX, [-50, 50], [4, -4]);
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 100);
        mouseY.set(y * 100);
      }
    };
    
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    
    const card = cardRef.current;
    if (card) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (card) {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseenter', handleMouseEnter);
        card.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [mouseX, mouseY]);
  
  // Particle drift (4-6 small dust particles)
  const particles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: (i * 20) % 100,
    y: (i * 15) % 100,
    delay: i * 0.3,
    duration: 3 + (i % 2),
  }));
  
  const cardInView = useInView(cardRef, { once: true, margin: '-50px' });
  
  return (
    <motion.div
      ref={cardRef}
      id={sectionId}
      data-section-id={sectionId}
      data-feature-card
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      animate={cardInView && isInView ? { y: 0 } : { opacity: 0, y: 50 }}
      style={cardInView && isInView ? { opacity: globalProgress * intensity } : undefined}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        rotateX: tiltX,
        rotateY: tiltY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Cosmic Hovered Glow (gold → violet aura) */}
      <motion.div
        className="absolute -inset-2 rounded-2xl pointer-events-none"
        style={{
          background: isHovered
            ? `radial-gradient(circle, 
                rgba(242, 201, 76, ${0.4 * intensity}) 0%, 
                rgba(110, 45, 235, ${0.3 * intensity}) 50%, 
                transparent 100%)`
            : 'transparent',
          filter: 'blur(20px)',
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* 3D Depth Shadow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)',
          filter: 'blur(30px)',
          opacity: 0.5 * intensity,
          transform: 'translateZ(-20px)',
        }}
      />
      
      {/* Particle Drift */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-gold/30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              x: [0, 10, -10, 0],
              y: [0, -15, -5, 0],
              opacity: [0.2, 0.5, 0.2],
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
      
      {/* Main Card */}
      <motion.div
        ref={cardRef}
        className="relative bg-cosmic/90 backdrop-blur-sm border border-white/10 rounded-2xl p-8 h-full flex flex-col"
        style={{
          boxShadow: isHovered
            ? `0 20px 60px rgba(242, 201, 76, ${0.3 * intensity}), 0 0 ${30 * intensity}px rgba(110, 45, 235, ${0.2 * intensity})`
            : `0 10px 30px rgba(0, 0, 0, 0.3)`,
          transform: 'translateZ(0)',
        }}
        animate={{
          y: isHovered ? -8 : 0,
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => {
          setIsHovered(true);
          // Emit scene event for card hover (Phase 12 - F27)
          orchestrator.emitSceneEvent('card-hover-start', {
            id: feature.id,
            intensity: intensity,
          });
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          // Emit scene event for card hover end (Phase 12 - F27)
          orchestrator.emitSceneEvent('card-hover-end', {
            id: feature.id,
          });
        }}
      >
        {/* Premium Badge */}
        {feature.isPremium && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gold/20 border border-gold/50 rounded-full text-gold text-xs font-heading">
            Premium
          </div>
        )}
        
        {/* Locked Overlay */}
        {feature.isLocked && (
          <div className="absolute inset-0 bg-cosmic/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <div className="text-4xl">🔒</div>
              <p className="text-white/60 text-sm">Premium Feature</p>
            </div>
          </div>
        )}
        
        {/* Icon Mandala Ring (rotating 0.1deg/sec) */}
        <motion.div
          className="relative w-20 h-20 mb-6"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 3600, // 0.1deg/sec = 3600 seconds
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="absolute inset-0 border-2 border-gold/30 rounded-full" />
          <div className="absolute inset-2 border border-aura-blue/20 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl">✨</div>
            {/* TODO: Replace with actual icon image when available */}
            {/* <Image src={feature.icon} alt={feature.title} width={40} height={40} /> */}
          </div>
        </motion.div>
        
        {/* Content */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gold font-heading text-sm mb-4">
              {feature.subtitle}
            </p>
          </div>
          
          {/* Bullet Highlights */}
          <ul className="space-y-2">
            {feature.highlights.map((highlight, i) => (
              <motion.li
                key={i}
                className="text-white/70 text-sm flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={cardInView ? { x: 0 } : { opacity: 0, x: -10 }}
                style={cardInView ? { opacity: globalProgress } : undefined}
                transition={{ duration: 0.4, delay: index * 0.1 + i * 0.1 }}
              >
                <span className="text-gold mr-2">✦</span>
                <span>{highlight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* CTA */}
        {!feature.isLocked && (
          <div className="mt-6">
            <Link href={feature.href}>
              <Button
                size="sm"
                className="w-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 font-heading relative overflow-hidden group/btn"
              >
                <span className="relative z-10">Explore</span>
                {/* Golden Aura Pulse on Hover */}
                <motion.div
                  className="absolute inset-0 bg-gold/20"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.5, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>
          </div>
        )}
        
        {feature.isLocked && (
          <div className="mt-6">
            <Button
              size="sm"
              className="w-full bg-cosmic/50 text-white/50 border border-white/10 font-heading cursor-not-allowed"
              disabled
            >
              Upgrade to Unlock
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

