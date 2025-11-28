/**
 * Business Engine Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * Business idea compatibility checker
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Briefcase, Sparkles } from 'lucide-react';

interface BusinessEngineProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export const BusinessEngine: React.FC<BusinessEngineProps> = ({ onAnalysisComplete }) => {
  const [businessIdea, setBusinessIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!businessIdea.trim()) {
      alert('Please enter a business idea');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/career/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idea: businessIdea }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze business idea');
      }

      const data = await response.json();
      setAnalysis(data);
      onAnalysisComplete?.(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze business idea');
    } finally {
      setLoading(false);
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = 'absolute rounded-full bg-gold/30 animate-ping pointer-events-none';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-aura-cyan">Enter Your Business Idea</CardTitle>
          <CardDescription className="text-white/70">
            Describe your business idea and we&apos;ll analyze its compatibility with your astrological profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="business-idea" className="text-gold mb-2 block">
              Business Idea
            </Label>
            <Textarea
              id="business-idea"
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder="Describe your business idea in detail..."
              rows={6}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-gold"
            />
          </div>

          <Button
            onClick={(e) => {
              createRipple(e);
              handleAnalyze();
            }}
            disabled={loading || !businessIdea.trim()}
            className="w-full spiritual-gradient text-lg py-3 relative overflow-hidden"
          >
            {loading ? 'Analyzing...' : <><Sparkles className="inline-block mr-2 h-5 w-5" /> Analyze Compatibility</>}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-gold">Compatibility Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-white/70">Compatibility Score</p>
                <p className="text-4xl font-bold text-aura-cyan">
                  {analysis.compatibilityScore || 'N/A'}/100
                </p>
              </div>
              {analysis.analysis && (
                <p className="text-sm text-white/80">{analysis.analysis}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

