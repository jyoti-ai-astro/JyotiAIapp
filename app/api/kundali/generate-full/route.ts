// app/api/kundali/generate-full/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateFullKundali } from '@/lib/engines/kundali/generator';
import type { BirthDetails } from '@/lib/engines/kundali/swisseph-wrapper';
import { ensureFeatureAccess, consumeFeatureTicket } from '@/lib/payments/ticket-service';
import type { FeatureKey } from '@/lib/payments/feature-access';

export const dynamic = 'force-dynamic';

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

    if (!userData?.dob || !userData?.tob || !userData?.lat || !userData?.lng) {
      return NextResponse.json(
        { error: 'Birth details incomplete. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    // Parse birth details
    const dob = new Date(userData.dob);
    const [hours, minutes] = String(userData.tob).split(':').map(Number);

    const birthDetails: BirthDetails = {
      year: dob.getFullYear(),
      month: dob.getMonth() + 1,
      day: dob.getDate(),
      hour: hours || 0,
      minute: minutes || 0,
      second: 0,
      lat: userData.lat,
      lng: userData.lng,
      timezone: userData.timezone || 'Asia/Kolkata',
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
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } else {
      await consumeFeatureTicket(uid, featureKey);
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
