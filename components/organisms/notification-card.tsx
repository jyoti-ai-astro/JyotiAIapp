/**
 * NotificationCard Organism
 * 
 * Phase 3 — Section 3.20: Notifications Organism
 * Individual notification card
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface NotificationCardProps {
  /** Notification type */
  type: 'alert' | 'insight' | 'horoscope' | 'transit' | 'festival' | 'report';
  
  /** Title */
  title: string;
  
  /** Message */
  message: string;
  
  /** Timestamp */
  timestamp: string;
  
  /** Is read */
  read?: boolean;
  
  /** Icon */
  icon?: string;
  
  /** Action label */
  actionLabel?: string;
  
  /** On action click */
  onAction?: () => void;
  
  /** On dismiss */
  onDismiss?: () => void;
  
  /** Custom class */
  className?: string;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  message,
  timestamp,
  read = false,
  icon,
  actionLabel,
  onAction,
  onDismiss,
  className,
}) => {
  const typeIcons = {
    alert: '🔔',
    insight: '💡',
    horoscope: '✨',
    transit: '🪐',
    festival: '🕯️',
    report: '📄',
  };
  
  const typeColors = {
    alert: '#e85555',
    insight: '#4e9df3',
    horoscope: '#F4CE65',
    transit: '#9D4EDD',
    festival: '#F4CE65',
    report: '#42d87c',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="interactive"
        className={cn(
          'relative',
          !read && 'border-[#F4CE65]/30 bg-white/8',
          className
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <motion.div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${typeColors[type]}20`,
              border: `2px solid ${typeColors[type]}40`,
            }}
            animate={!read ? {
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: !read ? Infinity : 0,
            }}
          >
            {icon || typeIcons[type]}
          </motion.div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-base font-medium text-white mb-1">
                  {title}
                </h4>
                <p className="text-sm text-white/70">{message}</p>
              </div>
              {!read && (
                <div className="w-2 h-2 bg-[#F4CE65] rounded-full flex-shrink-0 mt-1 animate-pulse" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">
                {new Date(timestamp).toLocaleString()}
              </p>
              <div className="flex items-center gap-2">
                {actionLabel && onAction && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAction}
                  >
                    {actionLabel}
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDismiss}
                    iconLeft={
                      <Icon size="sm" className="w-4 h-4">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </Icon>
                    }
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

