export const dynamic = 'force-dynamic'
/**
 * Guru Voice API Route
 * 
 * Phase 3 — Section 32: PAGES PHASE 17 (F32)
 * Phase 28 — Section 43: SECURITY + VALIDATION LAYER (F43)
 * 
 * POST endpoint for voice transcription (STT)
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { rateLimitConfig } from '@/lib/security/validation-schemas';
import { validateAudioFile, checkFileCorruption } from '@/lib/security/file-validation';
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
    const rateLimitResult = rateLimit(fingerprint, rateLimitConfig.voice);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_hit', {
        endpoint: 'guru-voice',
        limit: rateLimitConfig.voice.maxRequests,
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
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Phase 28 - F43: Validate audio file
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      logSecurityEvent('file_validation_failure', {
        endpoint: 'guru-voice',
        reason: validation.error,
        fileSize: audioFile.size,
        fileType: audioFile.type,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Phase 28 - F43: Check file corruption
    const corruptionCheck = await checkFileCorruption(audioFile);
    if (corruptionCheck.corrupted) {
      logSecurityEvent('file_validation_failure', {
        endpoint: 'guru-voice',
        reason: 'file_corrupted',
        error: corruptionCheck.error,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: corruptionCheck.error || 'Audio file appears corrupted' },
        { status: 400 }
      );
    }

    // Create streaming response for transcript
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // In production, call OpenAI Whisper API or similar
          // For now, simulate transcription with placeholder
          const transcript = await transcribeAudio(audioFile);

          // Stream partial transcripts (simulated)
          const words = transcript.split(' ');
          for (let i = 0; i < words.length; i++) {
            const partial = words.slice(0, i + 1).join(' ');
            const data = JSON.stringify({ text: partial, isFinal: false });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            
            // Small delay for streaming effect
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Final transcript
          const finalData = JSON.stringify({ text: transcript, isFinal: true });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));

          controller.close();
        } catch (error) {
          logSecurityEvent('orchestrator_error', {
            reason: 'transcription_error',
            endpoint: 'guru-voice',
            error: error instanceof Error ? error.message : 'Unknown error',
          }, 'high', { fingerprint });
          
          controller.enqueue(encoder.encode(
            JSON.stringify({ error: 'Transcription failed. Please try again.' })
          ));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
      },
    });
  } catch (error) {
    logSecurityEvent('orchestrator_error', {
      reason: 'api_error',
      endpoint: 'guru-voice',
    }, 'high', { fingerprint });
    
    // Phase 29 - F44: Graceful fallback JSON
    return NextResponse.json(
      { 
        error: 'An error occurred. Please try again later.',
        message: 'The Guru voice connection was interrupted. Please try again.',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

/**
 * Transcribe audio file (placeholder - replace with actual STT API)
 */
async function transcribeAudio(audioFile: File): Promise<string> {
  // In production, this would call OpenAI Whisper API:
  // const formData = new FormData();
  // formData.append('file', audioFile);
  // formData.append('model', 'whisper-1');
  // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
  //   body: formData,
  // });
  // const data = await response.json();
  // return data.text;

  // Placeholder: return a sample transcript
  // In real implementation, this would use actual STT
  return 'This is a placeholder transcript. Please implement actual STT API integration.';
}

