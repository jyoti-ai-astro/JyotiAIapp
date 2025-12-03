export const dynamic = 'force-dynamic'
/**
 * Guru Chat API Route
 * 
 * Phase 3 — Section 30: PAGES PHASE 15 (F30)
 * Phase 28 — Section 43: SECURITY + VALIDATION LAYER (F43)
 * 
 * POST endpoint for AI Guru chat with streaming support
 * 
 * TODO: MEGA BUILD 1 - This route is deprecated in favor of /api/guru
 * Consider migrating clients to the new unified endpoint or proxying to it
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildGuruPrompt, GuruContext, UnifiedContext, OrchestratedSummary } from '@/lib/ai/guruPrompt';
import { OrchestratorV2 } from '@/lib/guru/orchestrator-v2';
import { chatMessageSchema, rateLimitConfig } from '@/lib/security/validation-schemas';
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
import { sanitizeMessage, detectSuspiciousPattern } from '@/lib/security/xss-protection';
import { safetyLayerV3, detectEmotionalState } from '@/lib/security/safety-layer-v3';
import { generateFingerprint, detectBotBehavior, checkCooldown, setCooldown, getCooldownMessage } from '@/lib/security/abuse-protection';
import { logSecurityEvent } from '@/lib/security/security-logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let fingerprint: string | undefined;
  
  try {
    // Phase 28 - F43: Generate fingerprint for abuse detection
    fingerprint = generateFingerprint({
      ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      headers: request.headers,
    });

    // Phase 28 - F43: Check cooldown
    const cooldownCheck = checkCooldown(fingerprint, 5000);
    if (cooldownCheck.inCooldown) {
      logSecurityEvent('abuse_detection', {
        reason: 'cooldown_active',
        remainingMs: cooldownCheck.remainingMs,
      }, 'low', { fingerprint });
      
      return NextResponse.json(
        { 
          error: getCooldownMessage(cooldownCheck.remainingMs!),
          cooldown: true,
        },
        { status: 429 }
      );
    }

    // Phase 28 - F43: Rate limiting
    const rateLimitResult = rateLimit(fingerprint, rateLimitConfig.chat);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_hit', {
        endpoint: 'guru-chat',
        limit: rateLimitConfig.chat.maxRequests,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: rateLimitResult.error || 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      );
    }

    // Phase 28 - F43: Validate payload size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 500000) { // ~500KB max
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // Phase 28 - F43: Parse and validate with Zod
    const body = await request.json();
    const validationResult = chatMessageSchema.safeParse(body);
    
    if (!validationResult.success) {
      logSecurityEvent('validation_failure', {
        endpoint: 'guru-chat',
        errors: validationResult.error.errors,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { 
      message, 
      context, 
      messageHistory = [], 
      memorySummary, 
      pastLifeSummary, 
      synergySummary, 
      predictionSummary, 
      compatibilitySummary, 
      reportSummary,
      unifiedContext,
      orchestratedSummary,
      intent,
    } = validationResult.data;

    // Phase 28 - F43: Sanitize message
    const sanitizedMessage = sanitizeMessage(message);
    
    // Phase 28 - F43: Detect suspicious patterns
    const suspiciousCheck = detectSuspiciousPattern(sanitizedMessage);
    if (suspiciousCheck.isSuspicious) {
      logSecurityEvent('suspicious_activity', {
        reason: suspiciousCheck.reason,
        messageLength: sanitizedMessage.length,
      }, 'high', { fingerprint });
      
      return NextResponse.json(
        { error: 'Message contains suspicious content. Please try again.' },
        { status: 400 }
      );
    }

    // Phase 28 - F43: Detect bot behavior
    const botCheck = detectBotBehavior(fingerprint, sanitizedMessage);
    if (botCheck.isBot) {
      logSecurityEvent('abuse_detection', {
        reason: botCheck.reason,
        type: 'bot_detection',
      }, 'high', { fingerprint });
      
      setCooldown(fingerprint, 60000); // 1 minute cooldown
      
      return NextResponse.json(
        { error: 'Suspicious activity detected. Please try again later.' },
        { status: 429 }
      );
    }

    // Initialize orchestrator (Phase 25 - F40)
    const orchestrator = new OrchestratorV2();

    // Latency guard (Phase 25 - F40)
    const maxLatency = 30000; // 30 seconds

    // Build system prompt with unified context and orchestrated summary (Phase 25 - F40)
    const systemPrompt = buildGuruPrompt(
      context || undefined, 
      memorySummary, 
      pastLifeSummary, 
      synergySummary, 
      predictionSummary, 
      compatibilitySummary, 
      reportSummary,
      unifiedContext, // Phase 25 - F40
      orchestratedSummary, // Phase 25 - F40
      intent // Phase 25 - F40
    );

    // Phase 28 - F43: Detect emotional state
    const emotionalState = detectEmotionalState(sanitizedMessage);

    // Create message array for AI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...messageHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: sanitizedMessage },
    ];

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = '';

        try {
          // Simulate AI response with streaming
          // In production, replace with actual AI API call (OpenAI, Anthropic, etc.)
          const aiResponse = generateGuruResponse(sanitizedMessage, context);
          
          // Phase 28 - F43: Apply safety layer V3
          const safetyCheck = safetyLayerV3(aiResponse, emotionalState);
          
          if (!safetyCheck.safe && !safetyCheck.sanitized) {
            logSecurityEvent('safety_layer_triggered', {
              reason: safetyCheck.reason,
              emotionalState,
            }, 'medium', { fingerprint });
            
            controller.enqueue(encoder.encode(
              'I understand your question, but I cannot provide that type of guidance. ' +
              'Please consult qualified professionals for medical, legal, or financial matters. ' +
              'How else can I help you on your spiritual journey?'
            ));
            controller.close();
            return;
          }
          
          const responseToStream = safetyCheck.sanitized || aiResponse;
          
          // Stream the response character by character for typing effect
          for (let i = 0; i < responseToStream.length; i++) {
            const chunk = responseToStream.substring(i, i + 1);
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
            
            // Small delay for typing effect
            await new Promise(resolve => setTimeout(resolve, 20));
            
            // Phase 28 - F43: Check latency
            if (Date.now() - startTime > maxLatency) {
              logSecurityEvent('orchestrator_error', {
                reason: 'latency_exceeded',
                latency: Date.now() - startTime,
              }, 'medium', { fingerprint });
              break;
            }
          }

          controller.close();
        } catch (error) {
          logSecurityEvent('orchestrator_error', {
            reason: 'streaming_error',
            error: error instanceof Error ? error.message : 'Unknown error',
          }, 'high', { fingerprint });
          
          controller.enqueue(encoder.encode(
            'I apologize, but I encountered an error. Please try again in a moment.'
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
    // Phase 28 - F43: Safe error handling (no internal leaks)
    // Phase 29 - F44: Enhanced with graceful fallback JSON
    logSecurityEvent('orchestrator_error', {
      reason: 'api_error',
      endpoint: 'guru-chat',
    }, 'high', { fingerprint });
    
    // Phase 29 - F44: Return graceful fallback JSON
    return NextResponse.json(
      { 
        error: 'An error occurred. Please try again later.',
        message: 'The Guru is temporarily unavailable. The divine energies are realigning. Please try again in a moment.',
        fallback: true,
      },
      { status: 500 }
    );
  }
}


/**
 * Safety check: Ensure response doesn't contain medical/financial advice
 */
function safetyCheck(response: string): string {
  // Remove any deterministic predictions
  const deterministicPatterns = [
    /will (happen|occur|take place) on \d+/gi,
    /exactly on \w+day/gi,
    /guaranteed to/gi,
    /definitely will/gi,
  ];

  let safeResponse = response;
  deterministicPatterns.forEach(pattern => {
    safeResponse = safeResponse.replace(pattern, 'may potentially');
  });

  // Add disclaimer if medical/financial keywords detected
  const medicalKeywords = ['diagnose', 'prescription', 'medicine', 'treatment', 'cure'];
  const financialKeywords = ['invest', 'buy stock', 'sell', 'guaranteed return'];
  
  const hasMedical = medicalKeywords.some(keyword => safeResponse.toLowerCase().includes(keyword));
  const hasFinancial = financialKeywords.some(keyword => safeResponse.toLowerCase().includes(keyword));

  if (hasMedical) {
    safeResponse += '\n\nNote: This is spiritual guidance only. Please consult a healthcare professional for medical concerns.';
  }
  if (hasFinancial) {
    safeResponse += '\n\nNote: This is spiritual guidance only. Please consult a financial advisor for financial decisions.';
  }

  return safeResponse;
}

/**
 * Generate Guru response (placeholder - replace with actual AI API)
 * Phase 16 - F31: Includes safety checks
 */
function generateGuruResponse(
  message: string,
  context?: GuruChatRequest['context']
): string {
  // Placeholder response generator
  // In production, this would call OpenAI, Anthropic, or another AI service
  
  const responses = [
    `Based on your cosmic blueprint, ${message.toLowerCase().includes('future') ? 'the stars indicate' : 'I sense that'} you are seeking guidance. Let me share some wisdom with you.`,
    `Your question touches on deep spiritual matters. ${context?.kundali ? 'Given your Kundali,' : 'From a cosmic perspective,'} I would suggest...`,
    `The universe speaks through many channels. ${context?.numerology ? `Your Life Path number ${context.numerology.lifePath} suggests` : 'The cosmic energies suggest'} that you are on the right path.`,
  ];

  // Simple response based on message content
  if (message.toLowerCase().includes('love') || message.toLowerCase().includes('relationship')) {
    return `Love is a divine force that flows through all of us. ${context?.kundali ? 'Your Venus placement in your Kundali' : 'The cosmic energies'} suggest focusing on self-love first. Practice the mantra "Om Namah Shivaya" daily, wear pink or rose colors, and face the northeast direction during meditation. Remember, true love begins within.`;
  }

  if (message.toLowerCase().includes('career') || message.toLowerCase().includes('job') || message.toLowerCase().includes('work')) {
    return `Your career path is guided by both your actions and cosmic influences. ${context?.numerology ? `Your Destiny number ${context.numerology.destiny} indicates` : 'The stars indicate'} that patience and persistence will lead to success. Chant "Om Gam Ganapataye Namaha" for career growth, wear yellow or gold, and face the north direction. Trust the divine timing.`;
  }

  if (message.toLowerCase().includes('health') || message.toLowerCase().includes('wellness')) {
    return `Health is the foundation of spiritual growth. ${context?.aura ? `Your ${context.aura.dominantColor} aura suggests` : 'The cosmic energies suggest'} focusing on balance. Practice daily pranayama, maintain a sattvic diet, and ensure your chakras are aligned. Remember, I cannot provide medical advice—please consult a healthcare professional for medical concerns.`;
  }

  // Default response
  let response = responses[Math.floor(Math.random() * responses.length)] + ` 

To help you further, I recommend:
- Daily meditation with the mantra "Om"
- Wearing colors that align with your chakra (consult your aura analysis)
- Facing auspicious directions during important activities
- Practicing gratitude and compassion

How else can I guide you on your spiritual journey?

May the cosmic energies guide you on your path. Blessings on your journey.`;

  // Apply safety checks
  response = safetyCheck(response);

  return response;
}

