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

    // Phase S: Ticket enforcement — DEV MODE: do NOT block on missing tickets
    const featureKey: FeatureKey = 'kundali';
    try {
      await ensureFeatureAccess(uid, featureKey);
    } catch (err: any) {
      const code = err?.code || err?.message || 'UNKNOWN';
      console.warn('[kundali] Ticket check failed, allowing anyway (DEV OVERRIDE):', code);
      // IMPORTANT: We do NOT return 403 anymore. We just log and continue.
    }

    // Get user birth details
    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
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
    const kundaliRef = adminDb.collection('kundali').doc(uid);

    // Save meta
    await kundaliRef.set(
      {
        meta: {
          ...kundali.meta,
          generatedAt:
            (kundali.meta as any).generatedAt instanceof Date
              ? (adminDb as any)?.constructor?.Timestamp?.fromDate?.(kundali.meta.generatedAt) ??
                kundali.meta.generatedAt
              : kundali.meta.generatedAt,
        },
      },
      { merge: true }
    ).catch((err: any) => {
      console.error('[kundali] meta write error (non-blocking)', err);
    });

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
      })
      .catch((err: any) => {
        console.error('[kundali] D1 write error (non-blocking)', err);
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
      })
      .catch((err: any) => {
        console.error('[kundali] dasha write error (non-blocking)', err);
      });

    // Phase S: Consume ticket after successful generation (best-effort only)
    try {
      await consumeFeatureTicket(uid, featureKey);
    } catch (err: any) {
      console.error('Ticket consumption error:', err);
    }

    return NextResponse.json({
      success: true,
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
      { success: false, message: 'Kundali generation failed in dev' },
      { status: 200 }
    );
  }
}
