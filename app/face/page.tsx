/**
 * Face Reading Page
 * 
 * Batch 4 - App Internal Screens Part 2
 * 
 * Upload face image for AI face reading analysis
 */

'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useFaceReading } from '@/lib/hooks/useFaceReading';
import { PageTransitionWrapper } from '@/components/global/PageTransitionWrapper';
import { CosmicCursor } from '@/components/global/CosmicCursor';
import { SoundscapeController } from '@/components/global/SoundscapeController';
import { CosmicBackground } from '@/components/dashboard/CosmicBackground';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, Camera, Sparkles, User } from 'lucide-react';
import { OneTimeOfferBanner } from '@/components/paywall/OneTimeOfferBanner';
import { checkFeatureAccess } from '@/lib/access/checkFeatureAccess';
import { decrementTicket } from '@/lib/access/ticket-access';
import type { AstroContext } from '@/lib/engines/astro-types';
import Link from 'next/link';

export default function FacePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { analysis, loading: analyzing, error, analyze } = useFaceReading();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [astro, setAstro] = useState<AstroContext | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchAstroContext();
    }
  }, [user, router]);

  const fetchAstroContext = async () => {
    if (!user?.uid) return;
    try {
      const response = await fetch('/api/astro/context', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAstro(data.astro);
      }
    } catch (err) {
      console.error('Error fetching astro context:', err);
    }
  };

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
    if (!imageFile || !imagePreview) return;

    // Check access before analyzing
    const access = await checkFeatureAccess(user, 'face');
    if (!access.allowed) {
      if (access.redirect || access.redirectTo) {
        router.push(access.redirect || access.redirectTo || '/pay/199');
      }
      return;
    }

    if (access.decrementTicket) {
      await decrementTicket('kundali_basic');
    }

    await analyze(imagePreview);

    // Decrement ticket if not subscription
    const hasSubscription =
      user?.subscription === 'pro' &&
      user?.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) > new Date();

    if (!hasSubscription && user?.tickets?.kundali_basic && user.tickets.kundali_basic > 0) {
      const { decrementTicket } = await import('@/lib/access/ticket-access');
      await decrementTicket('kundali_basic');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <PageTransitionWrapper>
      <CosmicBackground />
      <CosmicCursor />
      <SoundscapeController />
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Context Panel */}
          <div className="mb-8">
            <OneTimeOfferBanner
              title="Unlock Full Insights"
              description="This module uses your birth chart & predictions powered by Guru Brain."
              priceLabel="₹199"
              ctaLabel="Unlock Now"
              ctaHref="/pay/199"
            />
          </div>

          {/* Astro Summary Block */}
          {astro && (
            <div className="glass-card p-6 mb-10 rounded-2xl border border-gold/20">
              <h3 className="text-gold font-heading text-xl mb-2">Astro Summary</h3>
              <p className="text-white/80 text-sm">Sun Sign: {astro.coreChart?.sunSign || 'N/A'}</p>
              <p className="text-white/80 text-sm">Moon Sign: {astro.coreChart?.moonSign || 'N/A'}</p>
              <p className="text-white/80 text-sm">Ascendant: {astro.coreChart?.ascendantSign || 'N/A'}</p>
              <p className="text-white/80 text-sm mt-4">Next Major Dasha: {astro.dasha?.currentMahadasha?.planet || 'N/A'}</p>
            </div>
          )}

          <div className="text-center">
            <User className="mx-auto h-16 w-16 text-gold mb-4" />
            <h1 className="text-4xl font-display font-bold text-gold">Face Reading</h1>
            <p className="text-white/70 mt-2">Discover your personality through AI face analysis</p>
          </div>

          <Card className="bg-cosmic-indigo/80 backdrop-blur-sm border border-cosmic-purple/30 text-white shadow-cosmic-glow">
            <CardHeader className="text-center">
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
                onClick={handleUpload}
                disabled={!imageFile || analyzing}
                className="w-full spiritual-gradient text-lg py-3 relative overflow-hidden"
              >
                {analyzing ? 'Analyzing Face...' : <><Sparkles className="inline-block mr-2 h-5 w-5" /> Analyze My Face</>}
              </Button>
            </CardContent>
          </Card>

          {/* Ask Guru With Context Button */}
          {astro && (
            <div className="text-center mb-4">
              <Button
                onClick={() => router.push(`/guru?context=${encodeURIComponent(JSON.stringify(astro))}`)}
                className="gold-btn"
              >
                Ask Guru With My Birth Context
              </Button>
            </div>
          )}

          <div className="text-center">
            <Link href="/dashboard">
              <Button variant="outline" className="border-cosmic-purple/50 text-white/80 hover:bg-cosmic-purple/20">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransitionWrapper>
  );
}

