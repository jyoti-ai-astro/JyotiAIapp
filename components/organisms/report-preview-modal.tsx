/**
 * ReportPreviewModal Organism
 * 
 * Phase 3 — Section 3.8: Reports Center Organism
 * PDF viewer modal with page-flip effect
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface ReportPreviewModalProps {
  /** Is open */
  isOpen: boolean;
  
  /** Report title */
  title: string;
  
  /** PDF URL */
  pdfUrl?: string;
  
  /** Report content (if not PDF) */
  content?: string;
  
  /** On close handler */
  onClose: () => void;
  
  /** On download handler */
  onDownload?: () => void;
  
  /** Custom class */
  className?: string;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  title,
  pdfUrl,
  content,
  onClose,
  onDownload,
  className,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={cn(
                'w-full max-w-4xl max-h-[90vh]',
                'bg-[#1A1F3C] backdrop-blur-md',
                'border border-white/20 rounded-2xl',
                'shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
                'overflow-hidden',
                className
              )}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <div className="flex items-center gap-2">
                  {onDownload && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onDownload}
                      iconLeft={
                        <Icon size="sm" className="w-4 h-4">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </Icon>
                      }
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
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
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {pdfUrl ? (
                  <motion.iframe
                    src={pdfUrl}
                    className="w-full h-[600px] rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <motion.div
                    className="prose prose-invert max-w-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-white/90 whitespace-pre-line">
                      {content || 'Report content will appear here...'}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

