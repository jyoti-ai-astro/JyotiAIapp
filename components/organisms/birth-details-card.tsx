/**
 * BirthDetailsCard Organism
 * 
 * Phase 3 — Section 3.18: Profile Organism
 * Card for displaying and editing birth details
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface BirthDetailsCardProps {
  /** Birth date */
  birthDate: string;
  
  /** Birth time */
  birthTime: string;
  
  /** Birth place */
  birthPlace: string;
  
  /** Latitude */
  latitude?: number;
  
  /** Longitude */
  longitude?: number;
  
  /** Timezone */
  timezone?: string;
  
  /** On edit handler */
  onEdit?: () => void;
  
  /** Custom class */
  className?: string;
}

export const BirthDetailsCard: React.FC<BirthDetailsCardProps> = ({
  birthDate,
  birthTime,
  birthPlace,
  latitude,
  longitude,
  timezone,
  onEdit,
  className,
}) => {
  return (
    <Card variant="base" className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Birth Details</h3>
        {onEdit && (
          <Button
            variant="ghost"
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-white/60">Date of Birth</p>
          <p className="text-base text-white font-medium">{birthDate}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-white/60">Time of Birth</p>
          <p className="text-base text-white font-medium">{birthTime}</p>
        </div>
        
        <div className="space-y-1 md:col-span-2">
          <p className="text-xs text-white/60">Place of Birth</p>
          <p className="text-base text-white font-medium">{birthPlace}</p>
        </div>
        
        {(latitude !== undefined || longitude !== undefined) && (
          <div className="space-y-1">
            <p className="text-xs text-white/60">Coordinates</p>
            <p className="text-sm text-white/80">
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </p>
          </div>
        )}
        
        {timezone && (
          <div className="space-y-1">
            <p className="text-xs text-white/60">Timezone</p>
            <p className="text-sm text-white/80">{timezone}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

