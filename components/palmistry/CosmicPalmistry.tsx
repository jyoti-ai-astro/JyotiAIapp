/**
 * Cosmic Palmistry Component
 * 
 * Master Plan v1.0 - Section 5: Palmistry Screens
 * Cosmic-themed palmistry upload and analysis
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { Upload, Camera, Sparkles, Hand } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import { useRouter } from 'next/navigation';

interface CosmicPalmistryProps {
  leftPalmFile: File | null;
  rightPalmFile: File | null;
  leftPalmPreview: string | null;
  rightPalmPreview: string | null;
  onFileSelect: (file: File | null, side: 'left' | 'right') => void;
  onUpload: () => void;
  uploading: boolean;
  analyzing: boolean;
  analysis: any;
}

export const CosmicPalmistry: React.FC<CosmicPalmistryProps> = ({
  leftPalmFile,
  rightPalmFile,
  leftPalmPreview,
  rightPalmPreview,
  onFileSelect,
  onUpload,
  uploading,
  analyzing,
  analysis,
}) => {
  const { user } = useUserStore();
  const router = useRouter();

  const handleAnalyze = async () => {
    // Check access before analyzing
    const access = await checkFeatureAccess('palmistry');
    if (!access.allowed) {
      if (access.redirectTo) {
        router.push(access.redirectTo);
      }
      return;
    }

    // If user has tickets (not subscription), decrement after successful analysis
    const hasSubscription =
      user?.subscription === 'pro' &&
      user?.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date();

    // Call the original onUpload handler
    await onUpload();

    // Decrement ticket if not subscription (ticket will be decremented after successful API response)
    if (!hasSubscription && user?.tickets?.kundali_basic && user.tickets.kundali_basic > 0) {
      await decrementTicket('kundali_basic');
    }
  };
  return (
    <div className="min-h-screen bg-cosmic-navy text-white relative overflow-hidden">
      <CosmicBackground />
      
      <div className="container mx-auto p-6 space-y-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Hand className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-cosmic-gold">
            Scan Your Palms
          </h1>
          <p className="text-aura-cyan max-w-2xl mx-auto">
            Upload clear images of both your left and right palms to unlock insights into your life, career, marriage, money, and health
          </p>
        </motion.div>

        {/* Upload Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Palm */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-blue flex items-center gap-2">
                  <Hand className="w-5 h-5" />
                  Left Palm
                </CardTitle>
                <CardDescription className="text-aura-cyan">
                  Your dominant hand reveals your potential
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-aura-blue/30 rounded-xl cursor-pointer hover:border-aura-blue/50 transition-colors bg-cosmic-indigo/5">
                  {leftPalmPreview ? (
                    <img
                      src={leftPalmPreview}
                      alt="Left palm"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-aura-blue mb-4" />
                      <p className="text-sm text-aura-cyan">Click to upload or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileSelect(e.target.files?.[0] || null, 'left')}
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-aura-blue/30 text-aura-blue hover:bg-aura-blue/10"
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Palm */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-violet flex items-center gap-2">
                  <Hand className="w-5 h-5" />
                  Right Palm
                </CardTitle>
                <CardDescription className="text-aura-cyan">
                  Your non-dominant hand shows your inherited traits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-aura-violet/30 rounded-xl cursor-pointer hover:border-aura-violet/50 transition-colors bg-cosmic-indigo/5">
                  {rightPalmPreview ? (
                    <img
                      src={rightPalmPreview}
                      alt="Right palm"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-aura-violet mb-4" />
                      <p className="text-sm text-aura-cyan">Click to upload or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileSelect(e.target.files?.[0] || null, 'right')}
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-aura-violet/30 text-aura-violet hover:bg-aura-violet/10"
                    onClick={() => document.querySelectorAll('input[type="file"]')[1]?.click()}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10 p-6 rounded-xl"
        >
          <h3 className="text-aura-green font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Requirements for Best Results
          </h3>
          <ul className="space-y-2 text-aura-cyan/80 text-sm">
            <li>✨ Bright, natural lighting</li>
            <li>✨ Full palm visible in frame</li>
            <li>✨ No angles or distortions</li>
            <li>✨ All lines clearly visible</li>
            <li>✨ Maximum file size: 10MB</li>
          </ul>
        </motion.div>

        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleAnalyze}
            disabled={!leftPalmFile || !rightPalmFile || uploading || analyzing}
            className="cosmic-button hover-glow bg-gradient-to-r from-cosmic-purple to-aura-cyan text-white px-12 py-6 text-lg"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Uploading...
              </span>
            ) : analyzing ? (
              <span className="flex items-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Analyzing Your Palms...
              </span>
            ) : (
              'Analyze My Palms'
            )}
          </Button>
        </motion.div>

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <Card className="cosmic-card border-cosmic-gold/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-cosmic-gold">Palmistry Analysis</CardTitle>
                <CardDescription className="text-aura-cyan">
                  Insights into your life, career, marriage, money, and health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overview */}
                  {analysis.overallScore !== undefined && (
                    <div className="text-center p-6 rounded-xl bg-cosmic-gold/10 border border-cosmic-gold/30">
                      <p className="text-sm text-aura-cyan mb-2">Overall Score</p>
                      <p className="text-5xl font-bold text-cosmic-gold">{analysis.overallScore}/100</p>
                    </div>
                  )}

                  {/* Detailed Sections */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {['Life', 'Career', 'Marriage', 'Money', 'Health'].map((section) => (
                      <motion.div
                        key={section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="cosmic-card border-aura-blue/20 bg-cosmic-indigo/5 p-4 rounded-xl"
                      >
                        <h4 className="text-aura-blue font-semibold mb-2">{section}</h4>
                        <p className="text-sm text-aura-cyan/80">
                          {analysis[section.toLowerCase()] || 'Analysis pending...'}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recommended Mantra */}
                  {analysis.recommendedMantra && (
                    <div className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10 p-6 rounded-xl">
                      <h4 className="text-aura-violet font-semibold mb-3">Recommended Mantra</h4>
                      <p className="text-2xl font-display text-cosmic-gold text-center">
                        {analysis.recommendedMantra}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

