/**
 * Cosmic Cursor Component
 * 
 * Batch 1 - Core Landing & Marketing
 * 
 * Cursor trail with light orbs that fade after 300ms
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CosmicCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Array<{ id: number; x: number; y: number; timestamp: number }>>([]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Add to trail
      setTrail((prev) => {
        const newTrail = [...prev, { id: Date.now(), x: e.clientX, y: e.clientY, timestamp: Date.now() }];
        // Keep only last 5 orbs
        return newTrail.slice(-5);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Clean up old trail items
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail((prev) => prev.filter((item) => Date.now() - item.timestamp < 300));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Main cursor orb */}
      <motion.div
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          left: -8,
          top: -8,
        }}
      >
        <motion.div
          className="w-4 h-4 rounded-full bg-gold"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Trail orbs */}
      {trail.map((item, index) => {
        const age = Date.now() - item.timestamp;
        const opacity = Math.max(0, 1 - age / 300);
        const scale = 0.5 + (index / trail.length) * 0.5;

        return (
          <motion.div
            key={item.id}
            className="fixed pointer-events-none z-[9998]"
            style={{
              x: item.x,
              y: item.y,
              left: -4,
              top: -4,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity, scale }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="w-2 h-2 rounded-full bg-aura-cyan"
              style={{
                opacity,
                boxShadow: `0 0 ${8 * opacity}px rgba(23, 232, 246, ${opacity})`,
              }}
            />
          </motion.div>
        );
      })}

      {/* Stars that follow cursor lightly */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-[9997]"
          style={{
            x: springX,
            y: springY,
            left: -2,
            top: -2,
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 20],
            y: [0, (Math.random() - 0.5) * 20],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut',
          }}
        >
          <div className="w-1 h-1 rounded-full bg-white" />
        </motion.div>
      ))}
    </>
  );
}

