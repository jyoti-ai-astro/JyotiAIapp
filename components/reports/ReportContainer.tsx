/**
 * Report Container Component
 * 
 * Phase 3 — Section 38: PAGES PHASE 23 (F38)
 * 
 * Full-page scrollable cosmic container for reports
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMotionOrchestrator } from '@/components/providers/MotionProvider';
import { scrollParallaxY, scrollFadeIn } from '@/lib/motion/gsap-motion-bridge';

export interface ReportContainerProps {
  title: string;
  subtitle?: string;
  icon?: string;
  reportType: 'kundali' | 'numerology' | 'aura-chakra' | 'past-life' | 'prediction' | 'compatibility' | 'guru';
  children: React.ReactNode;
  onDownload?: () => void;
  pdfContextData?: any;
}

// Phase 30 - F45: Memoized ReportContainer for performance
export const ReportContainer = React.memo(function ReportContainer({
  title,
  subtitle,
  icon,
  reportType,
  children,
  onDownload,
  pdfContextData,
}: ReportContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { orchestrator } = useMotionOrchestrator();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Scroll parallax integration
  useEffect(() => {
    if (containerRef.current) {
      scrollParallaxY(containerRef.current, 0.05, {
        start: 'top bottom',
        end: 'bottom top',
      });
    }
  }, []);

  // Emit report loaded event
  useEffect(() => {
    orchestrator.emitSceneEvent('guru-report-loaded', { type: reportType });
  }, [reportType, orchestrator]);

  // Handle PDF download
  const handleDownload = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    orchestrator.emitSceneEvent('guru-pdf-start', {});

    try {
      // Use provided PDF context data
      const contextData = pdfContextData || {};

      const response = await fetch('/api/report-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: reportType,
          contextData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jyoti_report_${reportType}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      orchestrator.emitSceneEvent('guru-pdf-complete', {});
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
      if (onDownload) {
        onDownload();
      }
    }
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollProgress = window.scrollY / (containerRef.current.scrollHeight - window.innerHeight);
        orchestrator.emitSceneEvent('guru-report-scroll', { progress: scrollProgress });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [orchestrator]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-cosmic via-mystic to-cosmic relative overflow-hidden"
    >
      {/* Background: Nebula + Gold Grid */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Nebula gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-cosmic/40 to-gold/10" />
        
        {/* Gold grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(242, 201, 76, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(242, 201, 76, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        {/* Title Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="mb-12 md:mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gold/30 pb-6 md:pb-8"
        >
          <div className="flex items-center gap-4">
            {icon && (
              <motion.div
                className="text-4xl"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {icon}
              </motion.div>
            )}
            <div>
              <h1 className="text-4xl font-display font-bold text-gold mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/70 text-lg font-heading">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Download Button */}
          <motion.button
            onClick={handleDownload}
            disabled={isGeneratingPDF}
            className="px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 rounded-lg font-heading transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-[0_4px_16px_rgba(242,201,76,0.2)] hover:shadow-[0_6px_24px_rgba(242,201,76,0.3)]"
            whileHover={isGeneratingPDF ? {} : { scale: 1.05 }}
            whileTap={isGeneratingPDF ? {} : { scale: 0.95 }}
          >
            {isGeneratingPDF ? 'Generating Cosmic PDF…' : 'Download PDF'}
          </motion.button>
        </motion.div>

        {/* Report Content */}
        <div className="space-y-12 md:space-y-16">
          {children}
        </div>
      </div>
    </div>
  );
});

