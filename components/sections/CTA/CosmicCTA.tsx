/**
 * Cosmic CTA Component
 * 
 * Phase 3 — Section 19: PAGES PHASE 4 (F19)
 * 
 * Shared CTA section component with 6 cosmic variants
 */

'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { useCTAGlow } from '@/hooks/cta/use-cta-glow';
import { useCTAParallax } from '@/hooks/cta/use-cta-parallax';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { scrollGlowPulse } from '@/lib/motion/gsap-motion-bridge';

export interface CosmicCTAProps {
  /** CTA variant */
  variant: 'home' | 'astro' | 'cosmos' | 'premium' | 'about' | 'global' | 'guru';
  
  /** Primary CTA */
  primaryCTA?: {
    label: string;
    href: string;
  };
  
  /** Secondary CTA */
  secondaryCTA?: {
    label: string;
    href: string;
  };
  
  /** Title text */
  title?: string;
  
  /** Subtitle text */
  subtitle?: string;
  
  /** Description text */
  description?: string;
  
  /** Additional className */
  className?: string;
}

const defaultCTAs = {
  home: {
    title: 'Start Your Spiritual Journey',
    subtitle: 'Begin Your Cosmic Path',
    description: 'Experience the power of ancient wisdom combined with modern AI. Get your free reading and discover your destiny.',
    primaryCTA: {
      label: 'Start Free Reading',
      href: '/login',
    },
    secondaryCTA: {
      label: 'Explore Features',
      href: '/cosmos',
    },
  },
  astro: {
    title: 'Discover Your Cosmic Blueprint',
    subtitle: 'Unlock Your Astrological Destiny',
    description: 'Get your personalized Vedic birth chart, planetary positions, and dasha predictions. Understand how the cosmos influences your life.',
    primaryCTA: {
      label: 'Get Your Kundali',
      href: '/kundali',
    },
    secondaryCTA: {
      label: 'Learn More',
      href: '/about',
    },
  },
  cosmos: {
    title: 'Explore All Cosmic Features',
    subtitle: 'Experience the Full Power of Jyoti.ai',
    description: 'Discover all spiritual engines: Kundali, Numerology, Aura Scan, Palmistry, AI Guru, and Predictions. Your complete spiritual operating system.',
    primaryCTA: {
      label: 'Explore All Features',
      href: '/cosmos',
    },
    secondaryCTA: {
      label: 'View Pricing',
      href: '/premium',
    },
  },
  premium: {
    title: 'Unlock Your Full Cosmic Potential',
    subtitle: 'Upgrade to Premium',
    description: 'Access unlimited readings, advanced predictions, detailed reports, and priority AI Guru guidance. Your destiny, fully unlocked.',
    primaryCTA: {
      label: 'Upgrade to Unlock Destiny',
      href: '/premium#pricing',
    },
    secondaryCTA: {
      label: 'View Plans',
      href: '/premium',
    },
  },
  about: {
    title: 'Explore Our Vision',
    subtitle: 'A Story Written in the Stars',
    description: 'Learn about our mission to combine ancient Vedic wisdom with modern AI technology. Discover how we create a sacred cosmic chamber for spiritual guidance.',
    primaryCTA: {
      label: 'Explore Our Vision',
      href: '/about#mission',
    },
    secondaryCTA: {
      label: 'Contact Us',
      href: '/contact',
    },
  },
  global: {
    title: 'Experience Jyoti.ai',
    subtitle: 'Your Spiritual Operating System',
    description: 'Join thousands on their spiritual journey. Get started with Jyoti.ai and discover your cosmic destiny.',
    primaryCTA: {
      label: 'Experience Jyoti.ai',
      href: '/login',
    },
    secondaryCTA: {
      label: 'Learn More',
      href: '/about',
    },
  },
  guru: {
    title: 'Start Your Spiritual Conversation',
    subtitle: 'Connect with Your AI Guru',
    description: 'Begin chatting with your AI Spiritual Guide. Get personalized answers combining insights from Kundali, Numerology, Aura, and more.',
    primaryCTA: {
      label: 'Start Chatting',
      href: '/guru#chat',
    },
    secondaryCTA: {
      label: 'View Features',
      href: '/cosmos',
    },
  },
};

export function CosmicCTA({
  variant,
  primaryCTA,
  secondaryCTA,
  title,
  subtitle,
  description,
  className = '',
}: CosmicCTAProps) {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  
  // Section motion tracking with scroll features
  const sectionId = `cta-${variant}`;
  const { sectionRef: sectionMotionRef, smoothedProgress, scrollDirection, scrollVelocity } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator.onSectionEnter(sectionId);
    },
    onExit: () => {
      orchestrator.onSectionExit(sectionId);
    },
    onProgress: (progress) => {
      orchestrator.ctaPulse(progress, sectionId);
      // Pulse intensity based on scroll progress
      const pulseIntensity = 0.5 + progress * 0.5;
      orchestrator.scrollGlow(sectionId, pulseIntensity);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (sectionRef.current) {
      (sectionMotionRef as React.MutableRefObject<HTMLElement | null>).current = sectionRef.current;
    }
  }, [sectionRef, sectionMotionRef]);
  
  // Scroll-based glow pulse
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const ctaButtons = sectionRef.current.querySelectorAll('[data-cta-button]');
    const triggers = Array.from(ctaButtons).map((button) =>
      scrollGlowPulse(button, {
        start: 'top center',
        end: 'bottom center',
      })
    );
    
    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, []);
  
  // Get default content for variant
  const defaultContent = defaultCTAs[variant];
  const finalTitle = title || defaultContent.title;
  const finalSubtitle = subtitle || defaultContent.subtitle;
  const finalDescription = description || defaultContent.description;
  const finalPrimaryCTA = primaryCTA || defaultContent.primaryCTA;
  const finalSecondaryCTA = secondaryCTA || defaultContent.secondaryCTA;
  
  // Variant-specific intensity modifiers
  const variantIntensities = {
    home: 1.2, // Highest intensity
    astro: 1.0,
    cosmos: 1.0,
    premium: 1.3, // Gold premium glow
    about: 0.8, // Divine fade (soft)
    global: 1.0,
  };
  
  const variantIntensity = variantIntensities[variant];
  
  // Animation hooks
  const { glowIntensity, goldIntensity, violetIntensity, isHovered, setIsHovered } = useCTAGlow({
    baseIntensity: 0.5,
    pulse: true,
    pulseSpeed: 2,
    hoverMultiplier: 1.5,
    variantIntensity,
  });
  
  const { parallaxX, parallaxY } = useCTAParallax({
    intensity: 0.3,
    depth: 0.3,
    variantIntensity,
  });
  
  // Particle float effect
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (i * 8.33) % 100,
    y: (i * 7.5) % 100,
    delay: i * 0.2,
    duration: 3 + (i % 3),
  }));
  
  return (
    <section
      ref={sectionRef}
      id={sectionId}
      data-section-id={sectionId}
      className={`relative py-32 px-4 ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        // Emit scene event for CTA hover (Phase 12 - F27)
        orchestrator.emitSceneEvent('cta-hover');
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      style={{
        opacity: globalProgress,
      }}
    >
      {/* Sacred Geometry Ring */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          x: parallaxX,
          y: parallaxY,
        }}
      >
        <motion.div
          className="absolute w-96 h-96 rounded-full border-2"
          style={{
            borderColor: `rgba(242, 201, 76, ${glowIntensity * 0.3})`,
            opacity: glowIntensity * 0.5,
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute w-64 h-64 rounded-full border"
              style={{
                borderColor: `rgba(110, 45, 235, ${glowIntensity * 0.2})`,
                opacity: glowIntensity * 0.4,
              }}
            />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Cosmic Glow Gradient (Gold → Violet) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, 
            rgba(242, 201, 76, ${goldIntensity * 0.3}) 0%, 
            rgba(110, 45, 235, ${violetIntensity * 0.2}) 50%, 
            transparent 100%)`,
          opacity: glowIntensity,
        }}
      />
      
      {/* Subtle Particle Float Effect (Light Dust) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full bg-gold/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
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
      
      {/* 3D Depth Shadow with Soft Blur */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
          filter: 'blur(40px)',
          opacity: 0.5,
        }}
      />
      
      {/* Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { y: 0 } : { opacity: 0, y: 50 }}
        style={isInView ? { opacity: globalProgress } : undefined}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Subtitle */}
        {finalSubtitle && (
          <motion.p
            className="text-xl md:text-2xl text-gold font-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { y: 0 } : { opacity: 0, y: 20 }}
            style={isInView ? { opacity: globalProgress } : undefined}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {finalSubtitle}
          </motion.p>
        )}
        
        {/* Title with Shimmer Effect */}
        <motion.h2
          className="text-4xl md:text-6xl font-display font-bold text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { y: 0 } : { opacity: 0, y: 30 }}
          style={isInView ? { opacity: globalProgress } : undefined}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            textShadow: `0 0 ${glowIntensity * 30}px rgba(242, 201, 76, ${glowIntensity * 0.5})`,
          }}
        >
          {finalTitle}
        </motion.h2>
        
        {/* Description */}
        {finalDescription && (
          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { y: 0 } : { opacity: 0, y: 20 }}
            style={isInView ? { opacity: globalProgress } : undefined}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {finalDescription}
          </motion.p>
        )}
        
        {/* CTA Buttons */}
        {(finalPrimaryCTA || finalSecondaryCTA) && (
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { y: 0 } : { opacity: 0, y: 20 }}
            style={isInView ? { opacity: globalProgress } : undefined}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {finalPrimaryCTA && (
              <CTAButton
                label={finalPrimaryCTA.label}
                href={finalPrimaryCTA.href}
                variant="primary"
                glowIntensity={glowIntensity}
                variantType={variant}
              />
            )}
            {finalSecondaryCTA && (
              <CTAButton
                label={finalSecondaryCTA.label}
                href={finalSecondaryCTA.href}
                variant="secondary"
                glowIntensity={glowIntensity}
                variantType={variant}
              />
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

interface CTAButtonProps {
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
  glowIntensity: number;
  variantType: string;
}

function CTAButton({ label, href, variant, glowIntensity, variantType }: CTAButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { orchestrator } = useMotionOrchestrator();
  
  // Premium variant gets extra gold glow
  const isPremium = variantType === 'premium';
  const extraGlow = isPremium ? 1.3 : 1.0;
  
  if (variant === 'primary') {
    return (
      <Link href={href}>
        <motion.div
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onClick={() => {
            // Emit scene event for CTA click (Phase 12 - F27)
            orchestrator.emitSceneEvent('cta-click');
            // Trigger blessing wave for premium CTA (Phase 13 - F28)
            if (variantType === 'premium') {
              orchestrator.triggerBlessingWave(1.2);
            }
          }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated Aura Pulse Around Button */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(242, 201, 76, ${glowIntensity * 0.4 * extraGlow}) 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            <Button
              data-cta-button
              size="lg"
              className="relative bg-gold text-cosmic hover:bg-gold-light px-8 py-6 text-lg font-heading border-2 border-gold/50"
              style={{
                boxShadow: `0 0 ${glowIntensity * 30 * extraGlow}px rgba(242, 201, 76, ${glowIntensity * 0.6})`,
              }}
            >
              {label}
            </Button>
            
            {/* Micro-ripple on click */}
            {isPressed && (
              <motion.div
                className="absolute inset-0 rounded-full bg-white/30"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.div>
        </motion.div>
      </Link>
    );
  }
  
  // Secondary button
  return (
    <Link href={href}>
      <motion.div
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Outline Aura */}
          <motion.div
            className="absolute -inset-2 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(23, 232, 246, ${glowIntensity * 0.2}) 0%, transparent 70%)`,
              filter: 'blur(8px)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <Button
            data-cta-button
            size="lg"
            variant="outline"
            className="relative border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-heading"
            style={{
              boxShadow: `0 0 ${glowIntensity * 20}px rgba(23, 232, 246, ${glowIntensity * 0.3})`,
            }}
          >
            {label}
          </Button>
          
          {/* Micro-ripple on click */}
          {isPressed && (
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.div>
      </motion.div>
    </Link>
  );
}

