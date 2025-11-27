/**
 * Guru Video API Route
 * 
 * Phase 3 — Section 34: PAGES PHASE 19 (F34)
 * Phase 28 — Section 43: SECURITY + VALIDATION LAYER (F43)
 * 
 * POST endpoint for single-frame video analysis (fallback for low-power devices)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { rateLimitConfig } from '@/lib/security/validation-schemas';
import { generateFingerprint, checkCooldown, setCooldown, getCooldownMessage } from '@/lib/security/abuse-protection';
import { logSecurityEvent } from '@/lib/security/security-logger';

export async function POST(request: NextRequest) {
  let fingerprint: string | undefined;
  
  try {
    // Phase 28 - F43: Generate fingerprint
    fingerprint = generateFingerprint({
      ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      headers: request.headers,
    });

    // Phase 28 - F43: Check cooldown
    const cooldownCheck = checkCooldown(fingerprint, 5000);
    if (cooldownCheck.inCooldown) {
      return NextResponse.json(
        { error: getCooldownMessage(cooldownCheck.remainingMs!), cooldown: true },
        { status: 429 }
      );
    }

    // Phase 28 - F43: Rate limiting
    const rateLimitResult = rateLimit(fingerprint, rateLimitConfig.video);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_hit', {
        endpoint: 'guru-video',
        limit: rateLimitConfig.video.maxRequests,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      );
    }

    const formData = await request.formData();
    const frameFile = formData.get('frame') as File;
    const base64Frame = formData.get('base64') as string;

    let imageData: Buffer | null = null;

    if (frameFile) {
      // Phase 28 - F43: Validate file
      if (frameFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Frame file too large (max 10MB)' },
          { status: 400 }
        );
      }
      const arrayBuffer = await frameFile.arrayBuffer();
      imageData = Buffer.from(arrayBuffer);
    } else if (base64Frame) {
      // Phase 28 - F43: Validate base64
      if (base64Frame.length > 15 * 1024 * 1024) { // ~10MB base64 = ~15MB string
        return NextResponse.json(
          { error: 'Frame data too large (max 10MB)' },
          { status: 400 }
        );
      }
      // Remove data URL prefix if present
      const base64 = base64Frame.replace(/^data:image\/\w+;base64,/, '');
      imageData = Buffer.from(base64, 'base64');
    } else {
      return NextResponse.json(
        { error: 'Frame data is required (file or base64)' },
        { status: 400 }
      );
    }

    // Phase 28 - F43: Validate size
    if (imageData.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Frame data too large (max 10MB)' },
        { status: 400 }
      );
    }

    // Analyze frame (in production, use actual vision API)
    const insight = await analyzeVideoFrame(imageData);

    // Apply safety filtering
    if (insight.emotion?.primaryEmotion) {
      // Ensure no medical/financial advice in emotion readings
      // (already handled in structure)
    }

    return NextResponse.json({
      insight,
      timestamp: new Date().toISOString(),
    }, {
      headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
    });
  } catch (error) {
    logSecurityEvent('orchestrator_error', {
      reason: 'api_error',
      endpoint: 'guru-video',
    }, 'high', { fingerprint });
    
    // Phase 29 - F44: Graceful fallback JSON
    return NextResponse.json(
      { 
        error: 'An error occurred. Please try again later.',
        message: 'Video analysis was interrupted. Please try again.',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Analyze video frame (placeholder - replace with actual vision API)
 */
async function analyzeVideoFrame(imageData: Buffer): Promise<{
  aura?: {
    dominantColor: string;
    energyLevel: number;
  };
  emotion?: {
    primaryEmotion: string;
    intensity: number;
  };
  chakras?: {
    [key: string]: number;
  };
  gesture?: {
    type: 'namaste' | 'raised-palm' | 'smile' | 'sad' | 'none';
    confidence: number;
  };
}> {
  // In production, call OpenAI Vision API or specialized ML models
  // For now, return placeholder data
  return {
    aura: {
      dominantColor: 'Violet',
      energyLevel: 7.5,
    },
    emotion: {
      primaryEmotion: 'calm',
      intensity: 0.8,
    },
    chakras: {
      'Root': 6.5,
      'Sacral': 5.8,
      'Solar Plexus': 7.2,
      'Heart': 6.9,
      'Throat': 5.5,
      'Third Eye': 7.8,
      'Crown': 6.7,
    },
    gesture: {
      type: 'none',
      confidence: 0,
    },
  };
}

