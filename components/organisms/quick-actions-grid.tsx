/**
 * QuickActionsGrid Organism
 * 
 * Phase 3 — Section 3.2: Dashboard Overview Organism
 * Grid of quick action buttons
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'premium';
}

export interface QuickActionsGridProps {
  /** Actions to display */
  actions: QuickAction[];
  
  /** Custom class */
  className?: string;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4', className)}
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.6 + index * 0.05 }}
        >
          <Card
            variant="interactive"
            clickable
            hoverable
            className="h-full"
            onClick={action.onClick}
          >
            <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {action.icon}
              </motion.div>
              <span className="text-sm font-medium text-white/90">{action.label}</span>
              {action.variant === 'premium' && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-[#F4CE65] rounded-full animate-pulse" />
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

