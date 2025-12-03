/**
 * Report PDF API Route
 * 
 * Phase 3 — Section 39: PAGES PHASE 24 (F39)
 * Phase 28 — Section 43: SECURITY + VALIDATION LAYER (F43)
 */

import { NextRequest, NextResponse } from 'next/server';
// Phase 30 - F45: PDF builders loaded on demand (dynamic imports)
import { pdfReportSchema, rateLimitConfig } from '@/lib/security/validation-schemas';

export const dynamic = 'force-dynamic';
import { rateLimit, getRateLimitHeaders } from '@/lib/middleware/rate-limit';
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
    const cooldownCheck = checkCooldown(fingerprint, 10000); // 10s cooldown for PDF
    if (cooldownCheck.inCooldown) {
      return NextResponse.json(
        { error: getCooldownMessage(cooldownCheck.remainingMs!), cooldown: true },
        { status: 429 }
      );
    }

    // Phase 28 - F43: Rate limiting
    const rateLimitResult = rateLimit(fingerprint, rateLimitConfig.pdf);
    if (!rateLimitResult.allowed) {
      logSecurityEvent('rate_limit_hit', {
        endpoint: 'report-pdf',
        limit: rateLimitConfig.pdf.maxRequests,
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
    if (contentLength && parseInt(contentLength) > 1000000) { // 1MB max
      return NextResponse.json(
        { error: 'Payload too large' },
        { status: 413 }
      );
    }

    // Phase 28 - F43: Parse and validate with Zod
    const body = await request.json();
    const validationResult = pdfReportSchema.safeParse(body);
    
    if (!validationResult.success) {
      logSecurityEvent('validation_failure', {
        endpoint: 'report-pdf',
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

    const { type, contextData } = validationResult.data;

            let pdfBytes: Uint8Array;

            // Phase 30 - F45: Generate PDF based on type with dynamic imports
            switch (type) {
              case 'kundali': {
                const { buildKundaliPDF } = await import('@/lib/pdf/build-kundali-pdf');
                pdfBytes = await buildKundaliPDF(contextData);
                break;
              }
              case 'numerology': {
                const { buildNumerologyPDF } = await import('@/lib/pdf/build-numerology-pdf');
                pdfBytes = await buildNumerologyPDF(contextData);
                break;
              }
              case 'aura-chakra': {
                const { buildAuraPDF } = await import('@/lib/pdf/build-aura-pdf');
                pdfBytes = await buildAuraPDF(contextData);
                break;
              }
              case 'past-life': {
                const { buildPastLifePDF } = await import('@/lib/pdf/build-pastlife-pdf');
                pdfBytes = await buildPastLifePDF(contextData);
                break;
              }
              case 'prediction': {
                const { buildPredictionPDF } = await import('@/lib/pdf/build-prediction-pdf');
                pdfBytes = await buildPredictionPDF(contextData);
                break;
              }
              case 'compatibility': {
                const { buildCompatibilityPDF } = await import('@/lib/pdf/build-compatibility-pdf');
                pdfBytes = await buildCompatibilityPDF(contextData);
                break;
              }
              case 'guru': {
                const { buildGuruContextPDF } = await import('@/lib/pdf/build-guru-context-pdf');
                pdfBytes = await buildGuruContextPDF(contextData);
                break;
              }
      default:
        return NextResponse.json(
          { error: `Invalid report type: ${type}` },
          { status: 400 }
        );
    }

    // Return PDF as stream
    // Phase 28 - F43: Validate PDF buffer safety
    if (!pdfBytes || pdfBytes.length === 0) {
      logSecurityEvent('orchestrator_error', {
        reason: 'empty_pdf_buffer',
        endpoint: 'report-pdf',
        type,
      }, 'high', { fingerprint });
      
      return NextResponse.json(
        { error: 'PDF generation failed. Please try again.' },
        { status: 500 }
      );
    }

    // Phase 28 - F43: Check PDF size (max 50MB)
    if (pdfBytes.length > 50 * 1024 * 1024) {
      logSecurityEvent('orchestrator_error', {
        reason: 'pdf_too_large',
        endpoint: 'report-pdf',
        size: pdfBytes.length,
      }, 'medium', { fingerprint });
      
      return NextResponse.json(
        { error: 'Generated PDF is too large. Please contact support.' },
        { status: 500 }
      );
    }

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="jyoti_report_${type}.pdf"`,
        ...getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
      },
    });
  } catch (error) {
    logSecurityEvent('orchestrator_error', {
      reason: 'api_error',
      endpoint: 'report-pdf',
    }, 'high', { fingerprint });
    
    // Phase 29 - F44: Graceful fallback JSON
    return NextResponse.json(
      { 
        error: 'An error occurred. Please try again later.',
        message: 'PDF generation failed. The cosmic report is being realigned. Please try again.',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

