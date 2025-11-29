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
import Link from 'next/link';

export default function FacePage() {
  const router = useRouter();
  const { user } = useUserStore();
  const { analysis, loading: analyzing, error, analyze } = useFaceReading();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

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
    const { checkFeatureAccess } = await import('@/lib/access/checkFeatureAccess');
    const access = await checkFeatureAccess('palmistry'); // Face reading uses same ticket as palmistry
    if (!access.allowed) {
      if (access.redirectTo) {
        router.push(access.redirectTo);
      }
      return;
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
          {/* One-Time Offer Banner */}
          <OneTimeOfferBanner
            feature="Face Reading Analysis"
            description="Get AI-powered face reading with personality insights — included in Deep Insights."
            priceLabel="₹199"
            ctaLabel="Get Face Reading for ₹199"
            ctaHref="/pay/199"
          />

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

