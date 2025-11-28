/**
 * Cosmic Hero Component
 * 
 * Phase 3 — Section 17: PAGES PHASE 2 (F17)
 * 
 * Shared hero component for all top-level pages with cosmic-themed variants
 */

'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useGlobalProgress } from '@/hooks/use-global-progress';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { gsapHeroReveal, scrollParallaxY } from '@/lib/motion/gsap-motion-bridge';
import { useSectionMotion } from '@/hooks/motion/useSectionMotion';
import { useScrollMotion } from '@/hooks/motion/useScrollMotion';
import { Canvas } from '@react-three/fiber';
import { NebulaShader } from '@/components/cosmic/NebulaShader';
import { ParticleField } from '@/components/cosmic/ParticleField';
import { RotatingMandala } from '@/components/cosmic/RotatingMandala';

export interface CosmicHeroProps {
  /** Hero title */
  title: string;
  
  /** Hero subtitle */
  subtitle?: string;
  
  /** Hero description */
  description?: string;
  
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
  
  /** Hero variant */
  variant: 'home' | 'astro' | 'cosmos' | 'premium' | 'about' | 'legal' | 'contact' | 'support' | 'guru';
  
  /** Additional className */
  className?: string;
}

export function CosmicHero({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  variant,
  className = '',
}: CosmicHeroProps) {
  const { globalProgress } = useGlobalProgress();
  const { orchestrator } = useMotionOrchestrator();
  const scrollMotion = useScrollMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Section motion tracking with scroll features
  const sectionId = 'hero';
  const { sectionRef, smoothedProgress, scrollDirection, scrollVelocity } = useSectionMotion({
    sectionId,
    onEnter: () => {
      orchestrator.onSectionEnter(sectionId);
    },
    onExit: () => {
      orchestrator.onSectionExit(sectionId);
    },
    onProgress: (progress) => {
      orchestrator.scrollParallax(sectionId, progress);
      orchestrator.scrollReveal(sectionId, progress);
    },
  });
  
  // Sync refs
  useEffect(() => {
    if (heroRef.current) {
      (sectionRef as React.MutableRefObject<HTMLElement | null>).current = heroRef.current;
    }
  }, [heroRef, sectionRef]);
  
  // Scroll-based parallax for hero elements
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current || !descriptionRef.current) return;
    
    const titleTrigger = scrollParallaxY(titleRef.current, 0.3, {
      start: 'top bottom',
      end: 'bottom top',
    });
    
    const subtitleTrigger = scrollParallaxY(subtitleRef.current, 0.2, {
      start: 'top bottom',
      end: 'bottom top',
    });
    
    const descriptionTrigger = scrollParallaxY(descriptionRef.current, 0.15, {
      start: 'top bottom',
      end: 'bottom top',
    });
    
    return () => {
      titleTrigger.kill();
      subtitleTrigger.kill();
      descriptionTrigger.kill();
    };
  }, []);
  
  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * 20);
        mouseY.set(y * 20);
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Hero reveal animation with orchestrator
  useEffect(() => {
    if (heroRef.current && titleRef.current) {
      // Re-animate on route change
      const handleRouteChange = () => {
        if (heroRef.current && titleRef.current) {
          gsapHeroReveal({
            title: titleRef.current,
            subtitle: subtitleRef.current || undefined,
            description: descriptionRef.current || undefined,
            cta: ctaRef.current || undefined,
          });
        }
      };
      
      // Initial reveal
      handleRouteChange();
      orchestrator.onHeroLoaded();
      orchestrator.heroReveal({
        title: titleRef.current,
        subtitle: subtitleRef.current || null,
        description: descriptionRef.current || null,
        cta: ctaRef.current || null,
      });
      
      // Listen for route changes to re-animate
      orchestrator.register('hero-re-animate', (data: any) => {
        if (data.trigger === 'onRouteChange' && data.data?.type?.includes('enter')) {
          handleRouteChange();
        }
      });
      
      return () => {
        orchestrator.unregister('hero-re-animate');
      };
    }
  }, [orchestrator]);

  // Variant-specific styling
  const variantStyles = {
    home: {
      container: 'relative',
      title: 'text-6xl md:text-8xl font-display font-bold text-white mb-6',
      subtitle: 'text-2xl md:text-3xl text-gold font-heading mb-4',
      description: 'text-lg md:text-xl text-white/80 max-w-3xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
    astro: {
      container: 'relative',
      title: 'text-5xl md:text-7xl font-display font-bold text-white mb-6',
      subtitle: 'text-xl md:text-2xl text-aura-blue font-heading mb-4',
      description: 'text-base md:text-lg text-white/75 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
    cosmos: {
      container: 'relative',
      title: 'text-5xl md:text-7xl font-display font-bold text-white mb-6',
      subtitle: 'text-xl md:text-2xl text-aura-blue font-heading mb-4',
      description: 'text-base md:text-lg text-white/75 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
    premium: {
      container: 'relative',
      title: 'text-5xl md:text-7xl font-display font-bold text-gold mb-6',
      subtitle: 'text-xl md:text-2xl text-white/90 font-heading mb-4',
      description: 'text-base md:text-lg text-white/80 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
    about: {
      container: 'relative',
      title: 'text-5xl md:text-7xl font-display font-bold text-white mb-6',
      subtitle: 'text-xl md:text-2xl text-gold font-heading mb-4',
      description: 'text-base md:text-lg text-white/80 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
    legal: {
      container: 'relative',
      title: 'text-4xl md:text-6xl font-display font-bold text-white mb-6',
      subtitle: 'text-lg md:text-xl text-white/70 font-heading mb-4',
      description: 'text-base text-white/60 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none opacity-30',
    },
    contact: {
      container: 'relative',
      title: 'text-5xl md:text-7xl font-display font-bold text-white mb-6',
      subtitle: 'text-xl md:text-2xl text-aura-blue font-heading mb-4',
      description: 'text-base md:text-lg text-white/80 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
    support: {
      container: 'relative',
      title: 'text-5xl md:text-7xl font-display font-bold text-white mb-6',
      subtitle: 'text-xl md:text-2xl text-gold font-heading mb-4',
      description: 'text-base md:text-lg text-white/80 max-w-2xl mx-auto',
      decoration: 'absolute inset-0 flex items-center justify-center pointer-events-none',
    },
  };

  const styles = variantStyles[variant];

  // Variant-specific decorative elements
  const renderDecoration = () => {
    switch (variant) {
      case 'home':
        return (
          <>
            {/* Glowing chakra disc */}
            <motion.div
              className="absolute w-64 h-64 rounded-full border-2 border-gold/30"
              style={{
                x: springX,
                y: springY,
                opacity: 0.3 * globalProgress,
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
            />
            {/* Floating glyph particles */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-gold/20 text-4xl"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                >
                  ✦
                </motion.div>
              ))}
            </div>
          </>
        );
      
      case 'astro':
        return (
          <>
            {/* Rotating astral wheel */}
            <motion.div
              className="absolute w-80 h-80 rounded-full border border-aura/20"
              style={{
                x: springX,
                y: springY,
                opacity: 0.25 * globalProgress,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border border-aura/30" />
              </div>
            </motion.div>
            {/* Rune particles */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-aura/30 text-2xl"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${25 + (i % 4) * 15}%`,
                  }}
                  animate={{
                    rotate: [0, 180, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  ◊
                </motion.div>
              ))}
            </div>
          </>
        );
      
      case 'cosmos':
        return (
          <>
            {/* Blueprint grid */}
            <motion.div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(23, 232, 246, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(23, 232, 246, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                x: springX * 0.5,
                y: springY * 0.5,
              }}
            />
            {/* Cosmic engine icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-16 h-16 border border-aura/20 rounded"
                  style={{
                    left: `${25 + i * 20}%`,
                    top: `${40 + (i % 2) * 20}%`,
                  }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>
          </>
        );
      
      case 'premium':
        return (
          <>
            {/* Golden premium aura */}
            <motion.div
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(242, 201, 76, 0.2) 0%, rgba(242, 201, 76, 0.1) 50%, transparent 100%)',
                x: springX,
                y: springY,
                opacity: 0.4 * globalProgress,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Energy rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  className="absolute rounded-full border border-gold/30"
                  style={{
                    width: `${200 + i * 100}px`,
                    height: `${200 + i * 100}px`,
                  }}
                  animate={{
                    rotate: 360,
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 10 + i * 5,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: i * 0.5,
                  }}
                />
              </motion.div>
            ))}
          </>
        );
      
      case 'about':
        return (
          <>
            {/* Divine timeline glow */}
            <motion.div
              className="absolute w-full h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent"
              style={{
                top: '50%',
                opacity: 0.3 * globalProgress,
              }}
            />
            {/* Deity-inspired flourishes */}
            <div className="absolute inset-0">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-gold/20 text-3xl"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${20 + (i % 3) * 30}%`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </>
        );
      
      case 'legal':
        return (
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(242, 201, 76, 0.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        );
      
      case 'contact':
        return (
          <>
            {/* Cosmic loop particles */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-aura-blue"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>
          </>
        );
      
      case 'support':
        return (
          <>
            {/* Guided help particles */}
            <div className="absolute inset-0">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-gold/30 text-xl"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${25 + (i % 4) * 15}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  ●
                </motion.div>
              ))}
            </div>
          </>
        );
      
      case 'guru':
        return (
          <>
            {/* AI Guru energy orb */}
            <motion.div
              className="absolute w-96 h-96 rounded-full border-2 border-aura-blue/30"
              style={{
                x: springX,
                y: springY,
                opacity: 0.25 * globalProgress,
              }}
              animate={{
                scale: [1, 1.1, 1],
                rotate: 360,
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-aura-blue/40" />
              </div>
            </motion.div>
            {/* Wisdom particles */}
            <div className="absolute inset-0">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-aura-blue/30 text-2xl"
                  style={{
                    left: `${10 + i * 9}%`,
                    top: `${20 + (i % 5) * 15}%`,
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <section
      id="hero"
      data-section-id="hero"
      ref={heroRef}
      className={`relative min-h-screen flex items-center justify-center px-4 ${styles.container} ${className}`}
      style={{
        opacity: globalProgress,
      }}
    >
      {/* R3F Background Canvas */}
      {variant === 'home' && (
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
            <Suspense fallback={null}>
              <NebulaShader intensity={1.0} />
              <ParticleField count={3000} intensity={1.0} />
              <RotatingMandala speed={0.1} intensity={1.0} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Decorative background elements */}
      <div className={styles.decoration}>
        {renderDecoration()}
      </div>
      
      {/* Hero Glow Orb (hoverable for scene interaction) - Phase 12 - F27 */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        onMouseEnter={() => {
          // Emit scene event for hero hover (Phase 12 - F27)
          orchestrator.emitSceneEvent('hero-hover');
          // Trigger small blessing wave (Phase 13 - F28)
          orchestrator.triggerBlessingWave(0.3);
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-gold/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center space-y-8 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: globalProgress, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {subtitle && (
          <motion.p
            ref={subtitleRef}
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: globalProgress, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
        
        <motion.h1
          ref={titleRef}
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: globalProgress, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {title}
        </motion.h1>
        
        {description && (
          <motion.p
            ref={descriptionRef}
            className={styles.description}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: globalProgress, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {description}
          </motion.p>
        )}
        
        {(primaryCTA || secondaryCTA) && (
          <motion.div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: globalProgress, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            {primaryCTA && (
              <Link href={primaryCTA.href}>
                <Button
                  size="lg"
                  className="bg-gold text-cosmic hover:bg-gold-light px-8 py-6 text-lg font-heading"
                >
                  {primaryCTA.label}
                </Button>
              </Link>
            )}
            {secondaryCTA && (
              <Link href={secondaryCTA.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-heading"
                >
                  {secondaryCTA.label}
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

