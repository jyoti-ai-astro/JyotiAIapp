/**
 * TimelinePreviewCard Organism
 * 
 * Phase 3 — Section 3.2: Dashboard Overview Organism
 * Preview of upcoming timeline events
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  month: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  rating: number; // 1-5
}

export interface TimelinePreviewCardProps {
  /** Upcoming events */
  events: TimelineEvent[];
  
  /** View full timeline handler */
  onViewFull?: () => void;
  
  /** Custom class */
  className?: string;
}

export const TimelinePreviewCard: React.FC<TimelinePreviewCardProps> = ({
  events,
  onViewFull,
  className,
}) => {
  const impactColors = {
    high: '#e85555',
    medium: '#f7c948',
    low: '#42d87c',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card variant="gradient" className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Upcoming Timeline</h3>
          <Badge variant="info" size="sm">
            {events.length} Events
          </Badge>
        </div>
        
        {/* Events list */}
        <div className="space-y-3">
          {events.slice(0, 3).map((event, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            >
              <div
                className="w-2 h-2 rounded-full mt-2"
                style={{ backgroundColor: impactColors[event.impact] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{event.month}</span>
                  <Badge
                    variant={event.impact === 'high' ? 'error' : event.impact === 'medium' ? 'warning' : 'success'}
                    size="sm"
                  >
                    {event.impact}
                  </Badge>
                </div>
                <p className="text-sm text-white/70 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      size="xs"
                      className={cn(
                        'w-3 h-3',
                        i < event.rating ? 'text-[#F4CE65]' : 'text-white/20'
                      )}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </Icon>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {onViewFull && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewFull}
            className="w-full"
          >
            View Full Timeline
            <Icon size="sm" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </Icon>
          </Button>
        )}
      </Card>
    </motion.div>
  );
};

