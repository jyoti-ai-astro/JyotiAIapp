/**
 * NotificationList Organism
 * 
 * Phase 3 — Section 3.20: Notifications Organism
 * List of alerts, daily insights, horoscope
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'alert' | 'insight' | 'horoscope' | 'transit' | 'festival' | 'report';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon?: string;
}

export interface NotificationListProps {
  /** Notifications */
  notifications: Notification[];
  
  /** On notification click handler */
  onNotificationClick?: (notification: Notification) => void;
  
  /** On mark as read handler */
  onMarkAsRead?: (id: string) => void;
  
  /** Custom class */
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onNotificationClick,
  onMarkAsRead,
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
    <div className={cn('space-y-3', className)}>
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              variant="interactive"
              clickable
              hoverable
              onClick={() => {
                onNotificationClick?.(notification);
                if (!notification.read) {
                  onMarkAsRead?.(notification.id);
                }
              }}
              className={cn(
                'relative',
                !notification.read && 'border-[#F4CE65]/30 bg-white/8'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    backgroundColor: `${typeColors[notification.type]}20`,
                    border: `2px solid ${typeColors[notification.type]}40`,
                  }}
                >
                  {notification.icon || typeIcons[notification.type]}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-medium text-white">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-[#F4CE65] rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-white/50">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {notifications.length === 0 && (
        <Card className="text-center py-12">
          <p className="text-white/60">No notifications</p>
        </Card>
      )}
    </div>
  );
};

