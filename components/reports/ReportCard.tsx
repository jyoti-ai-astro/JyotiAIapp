/**
 * Report Card Component
 * 
 * Preview card for reports with download/view options
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Report } from '@/lib/engines/report-engine';

interface ReportCardProps {
  report: Report;
  onView?: (report: Report) => void;
  onDownload?: (report: Report) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onDownload,
}) => {
  const typeColors: Record<string, string> = {
    love: 'bg-pink-500/20 border-pink-500/50 text-pink-400',
    career: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    money: 'bg-green-500/20 border-green-500/50 text-green-400',
    health: 'bg-red-500/20 border-red-500/50 text-red-400',
    numerology: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    'kundali-summary': 'bg-gold/20 border-gold/50 text-gold',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white hover:border-gold/50 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-gold mb-2">{report.title}</CardTitle>
              <CardDescription className="text-white/70">{report.subtitle}</CardDescription>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${typeColors[report.type] || 'bg-white/10 border-white/30 text-white'}`}>
              {report.type.replace('-', ' ').toUpperCase()}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="h-4 w-4" />
            <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
          </div>

          <p className="text-white/80 text-sm line-clamp-2">{report.summary}</p>

          {report.keyInsights && report.keyInsights.length > 0 && (
            <div>
              <p className="text-xs text-white/60 mb-1">Key Insights:</p>
              <ul className="space-y-1">
                {report.keyInsights.slice(0, 2).map((insight, i) => (
                  <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                    <span className="text-gold mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(report)}
                className="flex-1 border-cosmic-purple/50 text-white hover:bg-cosmic-purple/20"
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(report)}
                className="flex-1 border-gold/50 text-gold hover:bg-gold/20"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

