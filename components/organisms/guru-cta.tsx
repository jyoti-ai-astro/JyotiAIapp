/**
 * GuruCTA Organism
 * 
 * Phase 3 — Section 3.2: Dashboard Overview Organism
 * Call-to-action card for AI Guru
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface GuruCTAProps {
  /** CTA message */
  message?: string;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Custom class */
  className?: string;
}

export const GuruCTA: React.FC<GuruCTAProps> = ({
  message = "Ask Guru anything about your spiritual journey",
  onClick,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card variant="glow" className={cn('relative overflow-hidden', className)}>
        {/* Animated gradient blob behind */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(157,78,221,0.4) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              className="text-4xl"
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            >
              🧘
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">AI Guru</h3>
              <p className="text-sm text-white/70">{message}</p>
            </div>
          </div>
          
          <Button
            variant="primary"
            onClick={onClick}
            iconRight={
              <Icon size="sm" className="w-4 h-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </Icon>
            }
          >
            Ask Now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

