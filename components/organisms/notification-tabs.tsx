/**
 * NotificationTabs Organism
 * 
 * Phase 3 — Section 3.20: Notifications Organism
 * Filter bar with tabs for notification types
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type NotificationFilter = 'all' | 'alert' | 'insight' | 'horoscope' | 'transit' | 'festival' | 'report';

export interface NotificationTabsProps {
  /** Active filter */
  activeFilter?: NotificationFilter;
  
  /** Unread counts per type */
  unreadCounts?: Record<string, number>;
  
  /** On filter change handler */
  onFilterChange?: (filter: NotificationFilter) => void;
  
  /** Custom class */
  className?: string;
}

const filters: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'alert', label: 'Alerts' },
  { value: 'insight', label: 'Insights' },
  { value: 'horoscope', label: 'Horoscope' },
  { value: 'transit', label: 'Transits' },
  { value: 'festival', label: 'Festivals' },
  { value: 'report', label: 'Reports' },
];

export const NotificationTabs: React.FC<NotificationTabsProps> = ({
  activeFilter = 'all',
  unreadCounts = {},
  onFilterChange,
  className,
}) => {
  return (
    <Card variant="base" className={cn('p-2', className)}>
      <div className="flex items-center gap-2 overflow-x-auto">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          const unreadCount = unreadCounts[filter.value] || 0;
          
          return (
            <motion.button
              key={filter.value}
              type="button"
              className={cn(
                'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'whitespace-nowrap',
                isActive
                  ? 'bg-[#F4CE65] text-[#060B1B]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              )}
              onClick={() => onFilterChange?.(filter.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label}
              {unreadCount > 0 && (
                <Badge
                  variant="error"
                  size="sm"
                  className="ml-2"
                >
                  {unreadCount}
                </Badge>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#060B1B] rounded-full"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
};

