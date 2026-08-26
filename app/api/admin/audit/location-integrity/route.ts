import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { withAdminAuth } from '@/lib/middleware/admin-middleware';
import { isValidCoordinate, isValidTimezone } from '@/lib/services/geocoding';

export const dynamic = 'force-dynamic';

const DELHI_LAT = 28.7041;
const DELHI_LNG = 77.1025;

function isLikelyDelhiFallback(userData: any): boolean {
  const pob = String(userData?.pob || '').toLowerCase();
  const lat = Number(userData?.lat);
  const lng = Number(userData?.lng);
  const isDelhiCoords = Math.abs(lat - DELHI_LAT) < 0.0002 && Math.abs(lng - DELHI_LNG) < 0.0002;
  return isDelhiCoords && !pob.includes('delhi');
}

function toMillis(value: any): number | null {
  if (!value) return null;
  const date = typeof value?.toDate === 'function' ? value.toDate() : value instanceof Date ? value : new Date(value);
  const millis = date.getTime();
  return Number.isNaN(millis) ? null : millis;
}

function addReason(reasons: Set<string>, condition: boolean, reason: string) {
  if (condition) reasons.add(reason);
}

export const GET = withAdminAuth(async (request: NextRequest) => {
  if (!adminDb) {
    return NextResponse.json({ error: 'Firestore not initialized' }, { status: 500 });
  }

  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') || 100);
  const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 100, 1), 200);
  const usersSnap = await adminDb.collection('users').limit(limit).get();

  const flagged: Array<{
    uid: string;
    pob?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
    derivedAstrologyStatus?: string;
    hasKundali: boolean;
    reasons: string[];
  }> = [];
  const counts: Record<string, number> = {};

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const kundaliRef = adminDb.collection('kundali').doc(userDoc.id);
    const [kundaliSnap, d1Snap, dashaSnap, astroContextSnap] = await Promise.all([
      kundaliRef.get(),
      kundaliRef.collection('D1').doc('chart').get(),
      kundaliRef.collection('dasha').doc('vimshottari').get(),
      adminDb.collection('users').doc(userDoc.id).collection('astroContext').doc('current').get(),
    ]);

    const reasons = new Set<string>();
    const hasKundali = kundaliSnap.exists;
    const hasValidCoordinates = isValidCoordinate(userData?.lat, userData?.lng);
    const hasValidTimezone = isValidTimezone(userData?.timezone);
    const kundaliData = kundaliSnap.data();
    const generatedAt = toMillis(kundaliData?.meta?.generatedAt);
    const locationVerifiedAt = toMillis(userData?.locationVerifiedAt);

    addReason(reasons, userData?.locationVerified !== true, 'MISSING_LOCATION_VERIFICATION');
    addReason(reasons, userData?.lat === undefined || userData?.lng === undefined, 'MISSING_COORDINATES');
    addReason(reasons, userData?.lat !== undefined && userData?.lng !== undefined && !hasValidCoordinates, 'INVALID_COORDINATES');
    addReason(reasons, !userData?.timezone, 'MISSING_TIMEZONE');
    addReason(reasons, !!userData?.timezone && !hasValidTimezone, 'INVALID_TIMEZONE');
    addReason(reasons, isLikelyDelhiFallback(userData), 'PROBABLE_DELHI_FALLBACK');
    addReason(reasons, userData?.derivedAstrologyStatus === 'stale', 'STALE_DERIVED_ASTROLOGY');
    addReason(reasons, kundaliData?.meta?.stale === true, 'STALE_KUNDALI');
    addReason(reasons, hasKundali && !d1Snap.exists, 'MISSING_KUNDALI_D1');
    addReason(reasons, hasKundali && !dashaSnap.exists, 'MISSING_KUNDALI_DASHA');
    addReason(reasons, astroContextSnap.data()?.stale === true, 'STALE_ASTRO_CONTEXT');
    addReason(
      reasons,
      hasKundali && (!locationVerifiedAt || (generatedAt !== null && generatedAt < locationVerifiedAt)),
      'KUNDALI_BEFORE_LOCATION_VERIFICATION'
    );
    addReason(
      reasons,
      hasKundali && (userData?.locationVerified !== true || !hasValidCoordinates || !hasValidTimezone || isLikelyDelhiFallback(userData)),
      'KUNDALI_FROM_UNVERIFIABLE_LOCATION'
    );

    if (reasons.size > 0) {
      const reasonList = Array.from(reasons).sort();
      for (const reason of reasonList) {
        counts[reason] = (counts[reason] || 0) + 1;
      }

      flagged.push({
        uid: userDoc.id,
        pob: userData?.pob,
        lat: userData?.lat,
        lng: userData?.lng,
        timezone: userData?.timezone,
        derivedAstrologyStatus: userData?.derivedAstrologyStatus,
        hasKundali,
        reasons: reasonList,
      });
    }
  }

  return NextResponse.json({
    success: true,
    readOnly: true,
    scanned: usersSnap.size,
    flaggedCount: flagged.length,
    counts,
    flagged,
  });
});
