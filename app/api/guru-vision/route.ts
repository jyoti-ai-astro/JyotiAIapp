export const dynamic = 'force-dynamic'
/**
 * Guru Vision API Route
 * 
 * Phase 3 — Section 33: PAGES PHASE 18 (F33)
 * Phase 28 — Section 43: SECURITY + VALIDATION LAYER (F43)
 * 
 * POST endpoint for image analysis and spiritual insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { VisionEngine } from '@/lib/guru/vision-engine';
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { rateLimitConfig } from '@/lib/security/validation-schemas';
import { validateImageFile, checkFileCorruption } from '@/lib/security/file-validation';
import { generateFingerprint, checkCooldown, setCooldown, getCooldownMessage } from '@/lib/security/abuse-protection';
import { logSecurityEvent } from '@/lib/security/security-logger';
import { safetyLayerV3 } from '@/lib/security/safety-layer-v3';

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
    const rateLimitResult = rateLimit(fingerprint, rateLimitConfig.vision);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_hit', {
        endpoint: 'guru-vision',
        limit: rateLimitConfig.vision.maxRequests,
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
    const imageFile = formData.get('file') as File;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Phase 28 - F43: Validate image file
    const validation = validateImageFile(imageFile);
    if (!validation.valid) {
      logSecurityEvent('file_validation_failure', {
        endpoint: 'guru-vision',
        reason: validation.error,
        fileSize: imageFile.size,
        fileType: imageFile.type,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Phase 28 - F43: Check file corruption
    const corruptionCheck = await checkFileCorruption(imageFile);
    if (corruptionCheck.corrupted) {
      logSecurityEvent('file_validation_failure', {
        endpoint: 'guru-vision',
        reason: 'file_corrupted',
        error: corruptionCheck.error,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: corruptionCheck.error || 'Image file appears corrupted' },
        { status: 400 }
      );
    }

    // Analyze image
    const visionEngine = new VisionEngine();
    const results = await visionEngine.analyzeImage(imageFile);

    // Apply safety filtering
    const filteredResults = results.map(result => {
      // Remove any medical or financial advice from readings
      let reading = '';
      if (result.type === 'palm' && 'overall' in result.data) {
        reading = result.data.overall.reading || '';
      } else if (result.type === 'aura' && 'auraReading' in result.data) {
        reading = result.data.auraReading || '';
      } else if (result.type === 'emotion' && 'reading' in result.data) {
        reading = result.data.reading || '';
      } else if (result.type === 'kundali' && 'reading' in result.data) {
        reading = result.data.reading || '';
      } else if (result.type === 'document' && 'reading' in result.data) {
        reading = result.data.reading || '';
      }

      // Phase 28 - F43: Apply safety layer V3
      if (reading) {
        const safetyCheck = safetyLayerV3(reading);
        if (!safetyCheck.safe && safetyCheck.sanitized) {
          reading = safetyCheck.sanitized;
        } else if (!safetyCheck.safe) {
          reading = 'I see spiritual patterns in your image, but I cannot provide specific medical or financial guidance. Please consult qualified professionals for such matters.';
        }
      }

      return {
        ...result,
        data: {
          ...result.data,
          ...(reading ? { reading } : {}),
        },
      };
    });

    return NextResponse.json({
      results: filteredResults,
      timestamp: new Date().toISOString(),
    }, {
      headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
    });
  } catch (error) {
    logSecurityEvent('orchestrator_error', {
      reason: 'api_error',
      endpoint: 'guru-vision',
    }, 'high', { fingerprint });
    
    // Phase 29 - F44: Graceful fallback JSON
    return NextResponse.json(
      { 
        error: 'An error occurred. Please try again later.',
        message: 'Vision analysis was interrupted. Please try uploading the image again.',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

