/**
 * Zodiac Badge Component
 * 
 * Batch 3 - Astro Components
 * 
 * Zodiac sign badge with cosmic styling
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface ZodiacBadgeProps {
  sign: string;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

const zodiacSymbols: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

export const ZodiacBadge: React.FC<ZodiacBadgeProps> = ({
  sign,
  variant = 'outline',
  className = '',
}) => {
  const symbol = zodiacSymbols[sign] || '●';

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge
        variant={variant}
        className={`border-aura-cyan text-aura-cyan ${className}`}
      >
        <span className="mr-1">{symbol}</span>
        {sign}
      </Badge>
    </motion.div>
  );
};

