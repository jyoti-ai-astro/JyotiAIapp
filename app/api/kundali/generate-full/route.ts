// app/api/kundali/generate-full/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateFullKundali } from '@/lib/engines/kundali/generator';
import type { BirthDetails } from '@/lib/engines/kundali/swisseph-wrapper';
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service';
import type { FeatureKey } from '@/lib/payments/feature-access';
import { isValidCoordinate, isValidTimezone } from '@/lib/services/geocoding';

export const dynamic = 'force-dynamic';

function isValidBirthDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date <= new Date();
}

function parseBirthTime(value: unknown): { hours: number; minutes: number } | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  return {
    hours: Number(match[1]),
    minutes: Number(match[2]),
  };
}

function isLikelyDelhiFallback(userData: any): boolean {
  const pob = String(userData?.pob || '').toLowerCase();
  const lat = Number(userData?.lat);
  const lng = Number(userData?.lng);
  const isDelhiCoords = Math.abs(lat - 28.7041) < 0.0002 && Math.abs(lng - 77.1025) < 0.0002;
  return isDelhiCoords && !pob.includes('delhi');
}

function validateKundaliBirthData(userData: any):
  | { ok: true; dob: Date; hours: number; minutes: number; lat: number; lng: number; timezone: string }
  | { ok: false; code: string; message: string } {
  if (!isValidBirthDate(userData?.dob)) {
    return { ok: false, code: 'INVALID_BIRTH_DATE', message: 'A valid date of birth is required before generating Kundali.' };
  }

  const time = parseBirthTime(userData?.tob);
  if (!time) {
    return { ok: false, code: 'INVALID_BIRTH_TIME', message: 'A valid birth time is required before generating Kundali.' };
  }

  if (!isValidCoordinate(userData?.lat, userData?.lng)) {
    return { ok: false, code: 'INVALID_COORDINATES', message: 'Verified birth coordinates are required before generating Kundali.' };
  }

  if (!isValidTimezone(userData?.timezone)) {
    return { ok: false, code: 'TIMEZONE_NOT_VERIFIED', message: 'A verified birth timezone is required before generating Kundali.' };
  }

  if (userData?.locationVerified === false || isLikelyDelhiFallback(userData)) {
    return { ok: false, code: 'LOCATION_NOT_VERIFIED', message: 'Please verify your birth location before generating Kundali.' };
  }

  return {
    ok: true,
    dob: new Date(userData.dob),
    hours: time.hours,
    minutes: time.minutes,
    lat: userData.lat,
    lng: userData.lng,
    timezone: userData.timezone,
  };
}

/**
 * Generate Full Kundali
 * Part B - Section 4: Step 8
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie || !adminAuth) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decodedClaims.uid;

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const source = typeof body?.source === 'string' ? body.source : null;
    const isOnboardingRequest = source === 'onboarding';
    const featureKey: FeatureKey = 'kundali';

    const userRef = adminDb.collection('users').doc(uid);
    const kundaliRef = adminDb.collection('kundali').doc(uid);
    const userSnap = await userRef.get();
    const kundaliSnap = await kundaliRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const hasFreeOnboardingKundali = !!userData?.freeOnboardingKundaliGeneratedAt;
    const isFirstOnboardingKundali =
      isOnboardingRequest && !kundaliSnap.exists && !hasFreeOnboardingKundali;

    if (isOnboardingRequest && (kundaliSnap.exists || hasFreeOnboardingKundali)) {
      return NextResponse.json({
        success: true,
        reused: true,
        source: 'onboarding',
      });
    }

    if (!isFirstOnboardingKundali) {
      try {
        await ensureFeatureAccess(uid, featureKey);
      } catch (err: any) {
        const code = err?.code || err?.message || 'UNKNOWN';
        if (code === 'NO_TICKETS') {
          return NextResponse.json(
            {
              success: false,
              code: 'NO_TICKETS',
              message: 'Kundali credits or an active subscription are required.',
            },
            { status: 403 }
          );
        }

        console.error('[kundali] Ticket check failed:', err);
        return NextResponse.json(
          {
            success: false,
            code: 'ACCESS_CHECK_FAILED',
            message: 'Unable to verify Kundali access.',
          },
          { status: 500 }
        );
      }
    }

    const birthValidation = validateKundaliBirthData(userData);
    if (!birthValidation.ok) {
      return NextResponse.json(
        {
          success: false,
          code: birthValidation.code,
          error: birthValidation.message,
        },
        { status: 400 }
      );
    }

    const birthDetails: BirthDetails = {
      year: birthValidation.dob.getFullYear(),
      month: birthValidation.dob.getMonth() + 1,
      day: birthValidation.dob.getDate(),
      hour: birthValidation.hours,
      minute: birthValidation.minutes,
      second: 0,
      lat: birthValidation.lat,
      lng: birthValidation.lng,
      timezone: birthValidation.timezone,
    };

    // Generate full kundali (defensive)
    if (typeof generateFullKundali !== 'function') {
      throw new Error('kundali generator unavailable');
    }

    const kundali = await generateFullKundali(birthDetails);
    if (!kundali || !kundali.meta) {
      throw new Error('kundali generation returned empty data');
    }

    // Save to Firestore
    await kundaliRef.set({
      meta: {
        ...kundali.meta,
        generatedAt:
          (kundali.meta as any).generatedAt instanceof Date
            ? kundali.meta.generatedAt
            : new Date(),
        generationKind: isFirstOnboardingKundali ? 'onboarding_basic' : 'paid_or_subscription',
        source: isFirstOnboardingKundali ? 'onboarding' : 'entitled',
        stale: false,
        staleReason: null,
        staleAt: null,
      },
    }, { merge: true });

    // Save D1 chart
    await kundaliRef
      .collection('D1')
      .doc('chart')
      .set({
        chartType: kundali.D1?.chartType,
        grahas: kundali.D1?.grahas,
        bhavas: kundali.D1?.bhavas,
        lagna: kundali.D1?.lagna,
        aspects: kundali.D1?.aspects,
      });

    // Save Dasha
    await kundaliRef
      .collection('dasha')
      .doc('vimshottari')
      .set({
        ...(kundali.dasha?.currentMahadasha
          ? {
              currentMahadasha: {
                ...kundali.dasha.currentMahadasha,
                startDate:
                  (adminDb as any)?.constructor?.Timestamp?.fromDate?.(
                    kundali.dasha.currentMahadasha.startDate
                  ) ?? kundali.dasha.currentMahadasha.startDate,
                endDate:
                  (adminDb as any)?.constructor?.Timestamp?.fromDate?.(
                    kundali.dasha.currentMahadasha.endDate
                  ) ?? kundali.dasha.currentMahadasha.endDate,
              },
            }
          : {}),
        ...(kundali.dasha?.currentAntardasha
          ? {
              currentAntardasha: {
                ...kundali.dasha.currentAntardasha,
                startDate:
                  (adminDb as any)?.constructor?.Timestamp?.fromDate?.(
                    kundali.dasha.currentAntardasha.startDate
                  ) ?? kundali.dasha.currentAntardasha.startDate,
                endDate:
                  (adminDb as any)?.constructor?.Timestamp?.fromDate?.(
                    kundali.dasha.currentAntardasha.endDate
                  ) ?? kundali.dasha.currentAntardasha.endDate,
              },
            }
          : {}),
        ...(kundali.dasha?.currentPratyantardasha
          ? {
              currentPratyantardasha: {
                ...kundali.dasha.currentPratyantardasha,
                startDate:
                  (adminDb as any)?.constructor?.Timestamp?.fromDate?.(
                    kundali.dasha.currentPratyantardasha.startDate
                  ) ?? kundali.dasha.currentPratyantardasha.startDate,
                endDate:
                  (adminDb as any)?.constructor?.Timestamp?.fromDate?.(
                    kundali.dasha.currentPratyantardasha.endDate
                  ) ?? kundali.dasha.currentPratyantardasha.endDate,
              },
            }
          : {}),
      });

    if (isFirstOnboardingKundali) {
      await userRef.set(
        {
          freeOnboardingKundaliGeneratedAt: new Date(),
          derivedAstrologyStatus: 'current',
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } else {
      await consumeFeatureTicket(uid, featureKey);
      await userRef.set(
        {
          derivedAstrologyStatus: 'current',
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      success: true,
      source: isFirstOnboardingKundali ? 'onboarding' : 'entitled',
      kundali: {
        ...kundali,
        meta: {
          ...kundali.meta,
          generatedAt:
            (kundali.meta as any).generatedAt instanceof Date
              ? (kundali.meta as any).generatedAt.toISOString()
              : kundali.meta.generatedAt,
        },
      },
    });
  } catch (error: any) {
    console.error('[kundali] generate-full error', error);
    return NextResponse.json(
      { success: false, message: 'Kundali generation failed' },
      { status: 500 }
    );
  }
}
