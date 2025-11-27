/**
 * Transition Overlay Component
 * 
 * Phase 3 — Section 25: PAGES PHASE 10 (F25)
 * 
 * Full-screen cosmic transition overlay with mist, nebula, and shimmer effects
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';

export function TransitionOverlay() {
  const { orchestrator } = useMotionOrchestrator();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [transitionType, setTransitionType] = useState<'cosmic' | 'mandala' | 'nebula'>('cosmic');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const prevPathnameRef = useRef<string | null>(null);
  
  // Listen for route transitions
  useEffect(() => {
    const handleRouteChange = (data: any) => {
      if (data.trigger === 'onRouteChange') {
        const type = data.data?.type;
        if (type?.includes('enter')) {
          setIsVisible(true);
          if (type.includes('mandala')) setTransitionType('mandala');
          else if (type.includes('nebula')) setTransitionType('nebula');
          else setTransitionType('cosmic');
          
          // Hide after animation
          setTimeout(() => setIsVisible(false), 1500);
        } else if (type?.includes('exit')) {
          setIsVisible(true);
        }
      }
    };
    
    orchestrator.register('transition-overlay', handleRouteChange);
    
    return () => {
      orchestrator.unregister('transition-overlay');
    };
  }, [orchestrator]);
  
  // Detect route changes
  useEffect(() => {
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 1200);
    }
    prevPathnameRef.current = pathname;
  }, [pathname]);
  
  // Canvas animation for nebula swirl
  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let time = 0;
    
    const animate = () => {
      if (!isVisible) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Nebula swirl shader effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height)
      );
      
      gradient.addColorStop(0, `rgba(157, 78, 221, ${0.3 * Math.sin(time * 0.5)})`);
      gradient.addColorStop(0.5, `rgba(110, 45, 235, ${0.2 * Math.sin(time * 0.3)})`);
      gradient.addColorStop(1, 'rgba(3, 0, 20, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      time += 0.02;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible]);
  
  // Gold shimmer particles
  const shimmerParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.05,
    duration: 2 + Math.random() * 2,
  }));
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Cosmic Mist Canvas Background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, rgba(157, 78, 221, 0.2) 0%, rgba(3, 0, 20, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          />
          
          {/* Nebula Swirl Shader Layer */}
          {transitionType === 'nebula' && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 opacity-60"
            />
          )}
          
          {/* Mandala Fade Layer */}
          {transitionType === 'mandala' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'power3.out' }}
            >
              <div
                className="w-96 h-96 rounded-full border-2 border-gold/30"
                style={{
                  background: 'radial-gradient(circle, rgba(242, 201, 76, 0.1) 0%, transparent 70%)',
                  filter: 'blur(40px)',
                }}
              />
            </motion.div>
          )}
          
          {/* Gold Shimmer Particles */}
          <div className="absolute inset-0">
            {shimmerParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full bg-gold"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  boxShadow: '0 0 10px rgba(242, 201, 76, 0.8)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

