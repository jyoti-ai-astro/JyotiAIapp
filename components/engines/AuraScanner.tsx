/**
 * Aura Scanner Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * Aura scanning with rotating ring and chakra bars
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Camera, Sparkles, Heart, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuraScannerProps {
  onAnalysisComplete?: (analysis: any) => void;
}

const AuraRing3D = ({ primaryColor, energyScore }: { primaryColor: string; energyScore: number }) => {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center mx-auto mb-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${primaryColor}40, transparent, ${primaryColor}40)`,
        }}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full animate-pulse-slow",
          primaryColor === 'blue' && 'bg-aura-blue/50',
          primaryColor === 'green' && 'bg-aura-green/50',
          primaryColor === 'orange' && 'bg-aura-orange/50',
          primaryColor === 'red' && 'bg-aura-red/50',
          primaryColor === 'violet' && 'bg-aura-violet/50',
        )}
        style={{
          boxShadow: `0 0 ${energyScore / 5}px ${primaryColor === 'blue' ? '#17E8F6' : primaryColor === 'green' ? '#4ECB71' : primaryColor === 'orange' ? '#FF8C42' : primaryColor === 'red' ? '#FF6B6B' : '#9D4EDD'}`,
        }}
      />
      <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-cosmic-indigo to-cosmic-purple flex items-center justify-center border border-white/10">
        <Sparkles className="h-12 w-12 text-gold animate-pulse" />
      </div>
    </div>
  );
};

const ChakraBar = ({ name, level, color }: { name: string; level: number; color: string }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/80">{name}</span>
        <span className="text-gold">{level}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
    </div>
  );
};

export const AuraScanner: React.FC<AuraScannerProps> = ({ onAnalysisComplete }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    try {
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        setAnalyzing(true);
        setTimeout(() => {
          setAnalyzing(false);
          const result = {
            primaryColor: 'blue',
            energyScore: 85,
            chakras: {
              root: 80,
              sacral: 75,
              solar: 90,
              heart: 85,
              throat: 70,
              thirdEye: 88,
              crown: 82,
            },
          };
          setAnalysis(result);
          onAnalysisComplete?.(result);
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
        <CardHeader>
          <CardTitle className="text-2xl font-display text-gold">Upload Your Selfie</CardTitle>
          <CardDescription className="text-white/70">
            Upload a clear selfie to analyze your aura colors and chakra balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="selfie-upload" className="block text-lg font-medium text-gold">Selfie Image</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="selfie-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1 file:text-white file:bg-cosmic-purple/50 file:border-none file:rounded-md hover:file:bg-cosmic-purple/70 cursor-pointer"
              />
              <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20">
                <Camera className="h-5 w-5 text-white/70" />
              </Button>
            </div>
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-white/20 p-2 bg-white/5"
              >
                <img src={imagePreview} alt="Selfie preview" className="w-full rounded-lg object-cover" />
              </motion.div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!imageFile || uploading || analyzing}
            className="w-full spiritual-gradient text-lg py-3"
          >
            {uploading ? 'Uploading Energy Signature...' : analyzing ? 'Scanning Aura...' : <><Sparkles className="inline-block mr-2 h-5 w-5" /> Scan My Aura</>}
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
              <CardTitle className="text-2xl font-display text-gold">Aura Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AuraRing3D primaryColor={analysis.primaryColor} energyScore={analysis.energyScore} />
              <div className="space-y-4">
                <p className="text-gold font-semibold">Chakra Balance:</p>
                <ChakraBar name="Root" level={analysis.chakras.root} color="bg-aura-red" />
                <ChakraBar name="Sacral" level={analysis.chakras.sacral} color="bg-aura-orange" />
                <ChakraBar name="Solar Plexus" level={analysis.chakras.solar} color="bg-gold" />
                <ChakraBar name="Heart" level={analysis.chakras.heart} color="bg-aura-green" />
                <ChakraBar name="Throat" level={analysis.chakras.throat} color="bg-aura-cyan" />
                <ChakraBar name="Third Eye" level={analysis.chakras.thirdEye} color="bg-aura-violet" />
                <ChakraBar name="Crown" level={analysis.chakras.crown} color="bg-aura-violet" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

