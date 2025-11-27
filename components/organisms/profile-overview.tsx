/**
 * ProfileOverview Organism
 * 
 * Phase 3 — Section 3.18: Profile Organism
 * Avatar, name, birth details, Rashi + Nakshatra badge
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ProfileOverviewProps {
  /** User name */
  name: string;
  
  /** User email */
  email?: string;
  
  /** Avatar URL */
  avatarUrl?: string;
  
  /** Birth date */
  birthDate?: string;
  
  /** Birth time */
  birthTime?: string;
  
  /** Birth place */
  birthPlace?: string;
  
  /** Rashi */
  rashi?: string;
  
  /** Nakshatra */
  nakshatra?: string;
  
  /** On edit handler */
  onEdit?: () => void;
  
  /** Custom class */
  className?: string;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  name,
  email,
  avatarUrl,
  birthDate,
  birthTime,
  birthPlace,
  rashi,
  nakshatra,
  onEdit,
  className,
}) => {
  return (
    <Card variant="glow" className={cn('space-y-6', className)}>
      {/* Header with avatar */}
      <div className="flex items-start gap-6">
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Avatar with glow ring */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7B2CBF] to-[#9D4EDD] p-1">
            <div className="w-full h-full rounded-full bg-[#1A1F3C] flex items-center justify-center text-3xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span>{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          
          {/* Glow ring animation */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#F4CE65]"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
        
        <div className="flex-1 space-y-2">
          <div>
            <h2 className="text-2xl font-bold text-white">{name}</h2>
            {email && (
              <p className="text-sm text-white/60">{email}</p>
            )}
          </div>
          
          {/* Rashi and Nakshatra badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {rashi && (
              <Badge variant="premium" size="md">
                {rashi} Rashi
              </Badge>
            )}
            {nakshatra && (
              <Badge variant="guru" size="md">
                {nakshatra} Nakshatra
              </Badge>
            )}
          </div>
        </div>
        
        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            iconLeft={
              <Icon size="sm" className="w-4 h-4">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </Icon>
            }
          >
            Edit
          </Button>
        )}
      </div>
      
      {/* Birth details */}
      {(birthDate || birthTime || birthPlace) && (
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-sm font-medium text-white/80">Birth Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {birthDate && (
              <div>
                <p className="text-xs text-white/60 mb-1">Date of Birth</p>
                <p className="text-sm text-white">{birthDate}</p>
              </div>
            )}
            {birthTime && (
              <div>
                <p className="text-xs text-white/60 mb-1">Time of Birth</p>
                <p className="text-sm text-white">{birthTime}</p>
              </div>
            )}
            {birthPlace && (
              <div>
                <p className="text-xs text-white/60 mb-1">Place of Birth</p>
                <p className="text-sm text-white">{birthPlace}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

