/**
 * Face Reader Component
 * 
 * Batch 4 - Intelligence Engines
 * 
 * Face reading analysis with upload
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Camera, Sparkles } from 'lucide-react';

interface FaceReaderProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export const FaceReader: React.FC<FaceReaderProps> = ({ onAnalysisComplete }) => {
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
      // Placeholder upload logic
      setTimeout(() => {
        setUploading(false);
        setAnalyzing(true);
        setTimeout(() => {
          setAnalyzing(false);
          const result = {
            overallScore: 85,
            features: {
              eyes: 'Sharp and intelligent',
              nose: 'Well-proportioned',
              lips: 'Generous and kind',
            },
            personality: 'You have a balanced and harmonious face structure...',
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
          <CardTitle className="text-2xl font-display text-aura-cyan">Upload Your Face Photo</CardTitle>
          <CardDescription className="text-white/70">
            Upload a clear front-facing photo for detailed face reading analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="face-upload" className="block text-lg font-medium text-gold">
              Face Image
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="face-upload"
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
                <img src={imagePreview} alt="Face preview" className="w-full rounded-lg object-cover" />
              </motion.div>
            )}
          </div>

          <Button
            onClick={(e) => {
              createRipple(e);
              handleUpload();
            }}
            disabled={!imageFile || uploading || analyzing}
            className="w-full spiritual-gradient text-lg py-3 relative overflow-hidden"
          >
            {uploading ? 'Uploading...' : analyzing ? 'Analyzing Face...' : <><Sparkles className="inline-block mr-2 h-5 w-5" /> Analyze My Face</>}
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
              <CardTitle className="text-2xl font-display text-gold">Face Reading Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-lg font-medium text-white/70">Overall Score</p>
                <p className="text-4xl font-bold text-aura-cyan">{analysis.overallScore}/100</p>
              </div>
              <p className="text-sm text-white/80">{analysis.personality}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

