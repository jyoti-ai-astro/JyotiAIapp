/**
 * Cosmic Aura Component
 * 
 * Master Plan v1.0 - Section 7: Aura Scan Screen
 * Animated aura ring with chakra visualization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { Upload, Camera, Zap, Sparkles } from 'lucide-react';

interface CosmicAuraProps {
  imageFile: File | null;
  imagePreview: string | null;
  onFileSelect: (file: File | null) => void;
  onUpload: () => void;
  uploading: boolean;
  analyzing: boolean;
  analysis: any;
}

// Animated Aura Ring Component
function AuraRing({ colors, energy }: { colors: string[]; energy: number }) {
  const auraColors = colors.length > 0 ? colors : ['#17E8F6', '#9D4EDD'];
  
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${auraColors.join(', ')}, ${auraColors[0]})`,
          filter: 'blur(20px)',
          opacity: 0.6,
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Main aura ring */}
      <motion.div
        className="absolute inset-4 rounded-full border-4"
        style={{
          borderImage: `conic-gradient(from 0deg, ${auraColors.join(', ')}, ${auraColors[0]}) 1`,
          borderImageSlice: 1,
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Center energy indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-24 h-24 rounded-full bg-gradient-to-br from-aura-cyan to-aura-violet"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{energy}%</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Chakra Bars Component
function ChakraBars({ chakras }: { chakras: Record<string, number> }) {
  const chakraColors: Record<string, string> = {
    root: '#FF6B6B',
    sacral: '#FF8C42',
    solar: '#F2C94C',
    heart: '#4ECB71',
    throat: '#17E8F6',
    thirdEye: '#6E2DEB',
    crown: '#9D4EDD',
  };

  const chakraNames: Record<string, string> = {
    root: 'Root',
    sacral: 'Sacral',
    solar: 'Solar Plexus',
    heart: 'Heart',
    throat: 'Throat',
    thirdEye: 'Third Eye',
    crown: 'Crown',
  };

  return (
    <div className="space-y-4">
      {Object.entries(chakras).map(([chakra, score], index) => (
        <motion.div
          key={chakra}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white capitalize">
              {chakraNames[chakra] || chakra}
            </span>
            <span className="text-sm text-aura-cyan">{score}/100</span>
          </div>
          <div className="h-3 w-full rounded-full bg-cosmic-indigo/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                backgroundColor: chakraColors[chakra] || '#17E8F6',
                width: `${score}%`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export const CosmicAura: React.FC<CosmicAuraProps> = ({
  imageFile,
  imagePreview,
  onFileSelect,
  onUpload,
  uploading,
  analyzing,
  analysis,
}) => {
  const [energyLevels, setEnergyLevels] = useState({
    mental: 72,
    emotional: 65,
    spiritual: 89,
  });

  useEffect(() => {
    if (analysis) {
      setEnergyLevels({
        mental: analysis.mentalEnergy || 72,
        emotional: analysis.emotionalEnergy || 65,
        spiritual: analysis.spiritualEnergy || 89,
      });
    }
  }, [analysis]);

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
            <Zap className="w-16 h-16 text-cosmic-gold mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-cosmic-gold">
            Your Aura Today
          </h1>
          <p className="text-aura-cyan max-w-2xl mx-auto">
            Upload your selfie to discover your aura colors and chakra balance
          </p>
        </motion.div>

        {/* Upload Section */}
        {!analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="cosmic-card border-aura-cyan/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-cyan">Upload Your Selfie</CardTitle>
                <CardDescription className="text-aura-cyan/80">
                  Use natural lighting, face the camera directly, ensure clear visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-aura-cyan/30 rounded-xl cursor-pointer hover:border-aura-cyan/50 transition-colors bg-cosmic-indigo/5">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Selfie preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Camera className="w-16 h-16 text-aura-cyan mb-4" />
                      <p className="text-sm text-aura-cyan">Click to upload or drag and drop</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                  />
                </label>
                <Button
                  onClick={onUpload}
                  disabled={!imageFile || uploading || analyzing}
                  className="cosmic-button w-full hover-glow bg-gradient-to-r from-cosmic-purple to-aura-cyan text-white"
                >
                  {uploading ? 'Uploading...' : analyzing ? 'Analyzing Aura...' : 'Analyze My Aura'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Aura Ring */}
            <Card className="cosmic-card border-aura-violet/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-violet text-center">Aura Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <AuraRing
                  colors={analysis.auraColors || [analysis.primaryColor || '#17E8F6']}
                  energy={analysis.energyScore || 75}
                />
                <div className="mt-6 text-center space-y-2">
                  <p className="text-lg font-semibold text-white">
                    Primary: <span className="text-aura-cyan capitalize">{analysis.primaryColor || 'Blue'}</span>
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {(analysis.auraColors || []).map((color: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-cosmic-indigo/30 text-aura-cyan text-sm capitalize"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Energy Levels */}
            <Card className="cosmic-card border-aura-blue/30 bg-cosmic-indigo/10">
              <CardHeader>
                <CardTitle className="text-aura-blue">Energy Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(energyLevels).map(([type, level]) => (
                    <div key={type} className="text-center p-4 rounded-xl bg-cosmic-indigo/5">
                      <p className="text-sm text-aura-cyan mb-2 capitalize">{type}</p>
                      <p className="text-3xl font-bold text-aura-blue">{level}%</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chakra Map */}
            {analysis.chakraBalance && (
              <Card className="cosmic-card border-aura-green/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-green flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Chakra Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChakraBars chakras={analysis.chakraBalance} />
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card className="cosmic-card border-aura-orange/30 bg-cosmic-indigo/10">
                <CardHeader>
                  <CardTitle className="text-aura-orange">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-aura-cyan">
                        <span className="text-aura-orange mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

