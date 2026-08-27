// app/api/kundali/generate-full/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { generateFullKundali } from '@/lib/engines/kundali/generator';
import type { BirthDetails } from '@/lib/engines/kundali/swisseph-wrapper';
import {
  claimFeatureUse,
  releaseFeatureUseClaim,
} from '@/lib/payments/ticket-service';
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

function dateFromFirestore(value: any): Date | null {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isFreshOnboardingClaim(value: any): boolean {
  const claimedAt = dateFromFirestore(value);
  return !!claimedAt && Date.now() - claimedAt.getTime() < 10 * 60 * 1000;
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

  if (userData?.locationVerified !== true || isLikelyDelhiFallback(userData)) {
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
  let claimedFirstOnboardingKundali = false;
  let claimUserRef: FirebaseFirestore.DocumentReference | null = null;
  let paidKundaliClaim: {
    claimId: string;
    mode: 'subscription' | 'ticket';
  } | null = null;
  let paidClaimUid: string | null = null;

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
    const reuseD1Ref = kundaliRef.collection('D1').doc('chart');
    const reuseDashaRef = kundaliRef.collection('dasha').doc('vimshottari');

    const [
      userSnap,
      kundaliSnap,
      reuseD1Snap,
      reuseDashaSnap,
    ] = await Promise.all([
      userRef.get(),
      kundaliRef.get(),
      reuseD1Ref.get(),
      reuseDashaRef.get(),
    ]);

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();
    const hasFreeOnboardingKundali = !!userData?.freeOnboardingKundaliGeneratedAt;

    const reuseKundaliData = kundaliSnap.data() || {};
    const reuseD1Data = reuseD1Snap.data() || {};
    const reuseDashaData = reuseDashaSnap.data() || {};

    const canonicalKundaliReusable =
      kundaliSnap.exists &&
      reuseD1Snap.exists &&
      reuseDashaSnap.exists &&
      reuseKundaliData?.meta?.stale !== true &&
      Array.isArray(reuseD1Data?.grahas) &&
      reuseD1Data.grahas.length > 0 &&
      Array.isArray(reuseD1Data?.bhavas) &&
      reuseD1Data.bhavas.length > 0 &&
      !!reuseD1Data?.lagna &&
      !!reuseDashaData?.currentMahadasha &&
      !!reuseDashaData?.currentAntardasha;


    // While onboarding is still incomplete, generation must be allowed to
    // repair/regenerate a stale or previously-created chart without charging
    // the user. Birth details may have changed after an earlier onboarding
    // attempt, so existence alone is NOT proof that the Kundali is current.
    let isFirstOnboardingKundali =
      isOnboardingRequest &&
      (
        userData?.onboarded !== true ||
        userData?.derivedAstrologyStatus === 'stale' ||
        !canonicalKundaliReusable
      );

    // An already-onboarded user must never receive another free onboarding
    // generation by spoofing source=onboarding.
    if (
      isOnboardingRequest &&
      userData?.onboarded === true &&
      userData?.derivedAstrologyStatus !== 'stale' &&
      canonicalKundaliReusable
    ) {
      return NextResponse.json({
        success: true,
        reused: true,
        source: 'onboarding',
      });
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

    if (isFirstOnboardingKundali) {
      const claimResult = await adminDb.runTransaction(async (transaction) => {
        const [
          freshUserSnap,
          freshKundaliSnap,
          freshD1Snap,
          freshDashaSnap,
        ] = await Promise.all([
          transaction.get(userRef),
          transaction.get(kundaliRef),
          transaction.get(reuseD1Ref),
          transaction.get(reuseDashaRef),
        ]);

        const freshUserData = freshUserSnap.data() || {};
        const freshKundaliData = freshKundaliSnap.data() || {};
        const freshD1Data = freshD1Snap.data() || {};
        const freshDashaData = freshDashaSnap.data() || {};

        const freshCanonicalKundaliReusable =
          freshKundaliSnap.exists &&
          freshD1Snap.exists &&
          freshDashaSnap.exists &&
          freshKundaliData?.meta?.stale !== true &&
          Array.isArray(freshD1Data?.grahas) &&
          freshD1Data.grahas.length > 0 &&
          Array.isArray(freshD1Data?.bhavas) &&
          freshD1Data.bhavas.length > 0 &&
          !!freshD1Data?.lagna &&
          !!freshDashaData?.currentMahadasha &&
          !!freshDashaData?.currentAntardasha;
        // Existing Kundali/free-generation markers do not mean the chart is
        // still valid during incomplete onboarding. A changed birth profile
        // must be allowed to regenerate the canonical chart.
        if (
          freshUserData.onboarded === true &&
          freshUserData.derivedAstrologyStatus !== 'stale' &&
          freshCanonicalKundaliReusable
        ) {
          return 'reused' as const;
        }

        if (isFreshOnboardingClaim(freshUserData.freeOnboardingKundaliClaimedAt)) {
          return 'in_progress' as const;
        }

        transaction.set(
          userRef,
          {
            freeOnboardingKundaliClaimedAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        );

        return 'claimed' as const;
      });

      if (claimResult === 'reused') {
        return NextResponse.json({
          success: true,
          reused: true,
          source: 'onboarding',
        });
      }

      if (claimResult === 'in_progress') {
        return NextResponse.json(
          {
            success: false,
            code: 'KUNDALI_GENERATION_IN_PROGRESS',
            message: 'Your first Kundali is already being generated. Please wait a moment and refresh.',
          },
          { status: 409 }
        );
      }

      claimedFirstOnboardingKundali = true;
      claimUserRef = userRef;
      isFirstOnboardingKundali = true;
    }

    if (!isFirstOnboardingKundali) {
      try {
        const claim = await claimFeatureUse(
          uid,
          featureKey,
          'kundaliGenerationClaim',
          30 * 60 * 1000
        );

        if (claim.status === 'in_progress') {
          return NextResponse.json(
            {
              success: false,
              code: 'KUNDALI_GENERATION_IN_PROGRESS',
              message: 'A Kundali generation is already in progress. Please wait a moment and refresh.',
            },
            { status: 409 }
          );
        }

        if (!claim.claimId || !claim.mode) {
          throw new Error('Kundali generation claim was incomplete');
        }

        paidKundaliClaim = {
          claimId: claim.claimId,
          mode: claim.mode,
        };
        paidClaimUid = uid;
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

        console.error('[kundali] Generation claim failed:', err);
        return NextResponse.json(
          {
            success: false,
            code: 'ACCESS_CHECK_FAILED',
            message: 'Unable to reserve Kundali generation access.',
          },
          { status: 500 }
        );
      }
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

    const kundaliMetaPayload = {
      ...kundali.meta,
      generatedAt:
        (kundali.meta as any).generatedAt instanceof Date
          ? kundali.meta.generatedAt
          : new Date(),
      generationKind: isFirstOnboardingKundali
        ? 'onboarding_basic'
        : 'paid_or_subscription',
      source: isFirstOnboardingKundali ? 'onboarding' : 'entitled',
      stale: false,
      staleReason: null,
      staleAt: null,
    };

    const d1Payload = {
      chartType: kundali.D1?.chartType,
      grahas: kundali.D1?.grahas,
      bhavas: kundali.D1?.bhavas,
      lagna: kundali.D1?.lagna,
      aspects: kundali.D1?.aspects,
    };

    const dashaPayload = {
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
    };

    const d1Ref = kundaliRef.collection('D1').doc('chart');
    const dashaRef = kundaliRef.collection('dasha').doc('vimshottari');

    if (isFirstOnboardingKundali) {
      // Finalize the free onboarding Kundali atomically.
      await adminDb.runTransaction(async (transaction) => {
        const freshUserSnap = await transaction.get(userRef);
        const freshUserData = freshUserSnap.data() || {};

        if (!freshUserSnap.exists) {
          throw new Error('User not found during onboarding Kundali finalization');
        }

        if (!freshUserData.freeOnboardingKundaliClaimedAt) {
          throw new Error('Onboarding Kundali claim was lost before finalization');
        }

        transaction.set(
          kundaliRef,
          { meta: kundaliMetaPayload },
          { merge: true }
        );
        transaction.set(d1Ref, d1Payload);
        transaction.set(dashaRef, dashaPayload);
        transaction.set(
          userRef,
          {
            freeOnboardingKundaliGeneratedAt: new Date(),
            freeOnboardingKundaliClaimedAt: null,
            derivedAstrologyStatus: 'current',
            updatedAt: new Date(),
          },
          { merge: true }
        );
      });

      claimedFirstOnboardingKundali = false;
      claimUserRef = null;
    } else {
      if (!paidKundaliClaim) {
        throw new Error('Paid Kundali claim missing before finalization');
      }

      // The ticket/subscription reservation already happened atomically.
      // Persist all canonical Kundali state and clear the matching claim
      // in one Firestore transaction before exposing the result.
      await adminDb.runTransaction(async (transaction) => {
        const freshUserSnap = await transaction.get(userRef);

        if (!freshUserSnap.exists) {
          throw new Error('User not found during Kundali finalization');
        }

        const freshUserData = freshUserSnap.data() || {};
        const activeClaim = freshUserData.kundaliGenerationClaim;

        if (
          !activeClaim ||
          activeClaim.id !== paidKundaliClaim?.claimId
        ) {
          throw new Error('Kundali generation claim no longer matches');
        }

        transaction.set(
          kundaliRef,
          { meta: kundaliMetaPayload },
          { merge: true }
        );
        transaction.set(d1Ref, d1Payload);
        transaction.set(dashaRef, dashaPayload);
        transaction.set(
          userRef,
          {
            kundaliGenerationClaim: null,
            derivedAstrologyStatus: 'current',
            updatedAt: new Date(),
          },
          { merge: true }
        );
      });

      // Finalization committed the reserved entitlement and persisted result.
      // Do not refund this claim if a later response serialization issue occurs.
      paidKundaliClaim = null;
      paidClaimUid = null;
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
    if (paidKundaliClaim && paidClaimUid) {
      await releaseFeatureUseClaim(
        paidClaimUid,
        'kundali',
        'kundaliGenerationClaim',
        paidKundaliClaim.claimId,
        true
      ).catch((claimError: any) => {
        console.error('[kundali] failed to release paid generation claim', claimError);
      });
    }

    if (claimedFirstOnboardingKundali && claimUserRef) {
      await claimUserRef
        .set(
          {
            freeOnboardingKundaliClaimedAt: null,
            updatedAt: new Date(),
          },
          { merge: true }
        )
        .catch((claimError: any) => {
          console.error('[kundali] failed to clear onboarding claim', claimError);
        });
    }

    console.error('[kundali] generate-full error', error);
    return NextResponse.json(
      { success: false, message: 'Kundali generation failed' },
      { status: 500 }
    );
  }
}
