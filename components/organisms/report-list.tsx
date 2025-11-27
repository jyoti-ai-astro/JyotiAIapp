/**
 * ReportList Organism
 * 
 * Phase 3 — Section 3.8: Reports Center Organism
 * List of reports with cards
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface Report {
  id: string;
  type: 'karma' | 'life' | 'marriage' | 'business' | 'child-name' | 'monthly';
  title: string;
  generatedAt: string;
  status: 'completed' | 'generating' | 'locked';
  downloadUrl?: string;
}

export interface ReportListProps {
  /** Reports list */
  reports: Report[];
  
  /** On report click handler */
  onReportClick?: (report: Report) => void;
  
  /** On generate handler */
  onGenerate?: (type: Report['type']) => void;
  
  /** Custom class */
  className?: string;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  onReportClick,
  onGenerate,
  className,
}) => {
  const typeLabels = {
    karma: 'Karma Report',
    life: 'Life Report',
    marriage: 'Marriage Report',
    business: 'Business Report',
    'child-name': 'Child Name Report',
    monthly: 'Monthly Report',
  };
  
  const typeIcons = {
    karma: '🕉️',
    marriage: '💍',
    business: '💼',
    'child-name': '👶',
    monthly: '📅',
    life: '🌟',
  };
  
  return (
    <div className={cn('space-y-4', className)}>
      {reports.map((report, index) => (
        <motion.div
          key={report.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card
            variant="interactive"
            clickable={report.status === 'completed'}
            hoverable
            onClick={() => report.status === 'completed' && onReportClick?.(report)}
            className="relative"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-3xl flex-shrink-0">
                  {typeIcons[report.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                    <Badge variant="info" size="sm">
                      {typeLabels[report.type]}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/60">
                    Generated: {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {report.status === 'completed' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReportClick?.(report);
                    }}
                  >
                    View
                  </Button>
                )}
                {report.status === 'generating' && (
                  <motion.div
                    className="w-6 h-6 border-2 border-[#F4CE65] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                )}
                {report.status === 'locked' && (
                  <Badge variant="default" size="sm">
                    <Icon size="sm" className="w-3 h-3 mr-1">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </Icon>
                    Locked
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

