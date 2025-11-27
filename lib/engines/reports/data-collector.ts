/**
 * Reports Data Collector
 * Part B - Section 6: Reports Engine
 * Milestone 6 - Step 1
 * 
 * Collects and normalizes all user data for report generation
 */

import { adminDb } from '@/lib/firebase/admin'

export interface ReportDataset {
  user: {
    name: string
    email: string
    dob: string
    tob: string
    pob: string
    rashi: string
    nakshatra: string
  }
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
    lagna: any
    dasha: {
      currentMahadasha: any
      currentAntardasha: any
    }
  } | null
  numerology: {
    lifePathNumber: number
    destinyNumber: number
    expressionNumber: number
    soulUrgeNumber: number
    personalityNumber: number
  } | null
  palmistry: {
    overallScore: number
    traits: any
  } | null
  aura: {
    primaryColor: string
    energyScore: number
    chakraBalance: any
  } | null
}

/**
 * Collect all data for report generation
 */
export async function collectReportData(
  uid: string,
  includePalmistry: boolean = false,
  includeAura: boolean = false
): Promise<ReportDataset> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  // Get user profile
  const userRef = adminDb.collection('users').doc(uid)
  const userSnap = await userRef.get()
  const userData = userSnap.exists ? userSnap.data() : null

  if (!userData) {
    throw new Error('User not found')
  }

  // Get Kundali
  let kundali = null
  const kundaliRef = adminDb.collection('kundali').doc(uid)
  const kundaliSnap = await kundaliRef.get()
  
  if (kundaliSnap.exists) {
    const D1Snap = await kundaliRef.collection('D1').doc('chart').get()
    const dashaSnap = await kundaliRef.collection('dasha').doc('vimshottari').get()
    
    if (D1Snap.exists && dashaSnap.exists) {
      kundali = {
        grahas: D1Snap.data()?.grahas || {},
        bhavas: D1Snap.data()?.bhavas || {},
        lagna: D1Snap.data()?.lagna || null,
        dasha: {
          currentMahadasha: dashaSnap.data()?.currentMahadasha || null,
          currentAntardasha: dashaSnap.data()?.currentAntardasha || null,
        },
      }
    }
  }

  // Get Numerology
  let numerology = null
  if (userData.numerology) {
    numerology = {
      lifePathNumber: userData.numerology.lifePathNumber || 0,
      destinyNumber: userData.numerology.destinyNumber || 0,
      expressionNumber: userData.numerology.expressionNumber || 0,
      soulUrgeNumber: userData.numerology.soulUrgeNumber || 0,
      personalityNumber: userData.numerology.personalityNumber || 0,
    }
  }

  // Get Palmistry (if requested)
  let palmistry = null
  if (includePalmistry) {
    const palmistrySnap = await adminDb
      .collection('scans')
      .doc(uid)
      .collection('palmistry')
      .doc('latest')
      .get()
    
    if (palmistrySnap.exists) {
      const palmistryData = palmistrySnap.data()
      palmistry = {
        overallScore: palmistryData?.analysis?.overallScore || 0,
        traits: palmistryData?.analysis?.traits || {},
      }
    }
  }

  // Get Aura (if requested)
  let aura = null
  if (includeAura) {
    const auraSnap = await adminDb
      .collection('scans')
      .doc(uid)
      .collection('aura')
      .doc('latest')
      .get()
    
    if (auraSnap.exists) {
      const auraData = auraSnap.data()
      aura = {
        primaryColor: auraData?.analysis?.primaryColor || 'unknown',
        energyScore: auraData?.analysis?.energyScore || 0,
        chakraBalance: auraData?.analysis?.chakraBalance || {},
      }
    }
  }

  return {
    user: {
      name: userData.name || 'User',
      email: userData.email || '',
      dob: userData.dob || '',
      tob: userData.tob || '',
      pob: userData.pob || '',
      rashi: userData.rashi || '',
      nakshatra: userData.nakshatra || '',
    },
    kundali,
    numerology,
    palmistry,
    aura,
  }
}

/**
 * Normalize data for prediction engine
 */
export function normalizeData(dataset: ReportDataset): any {
  return {
    user: dataset.user,
    kundali: dataset.kundali
      ? {
          rashi: dataset.kundali.grahas?.moon?.sign || dataset.user.rashi,
          nakshatra: dataset.kundali.grahas?.moon?.nakshatra || dataset.user.nakshatra,
          lagna: dataset.kundali.lagna?.sign || '',
          currentDasha: dataset.kundali.dasha?.currentMahadasha?.planet || '',
          currentAntardasha: dataset.kundali.dasha?.currentAntardasha?.planet || '',
          planets: Object.values(dataset.kundali.grahas || {}).map((g: any) => ({
            name: g.planet,
            sign: g.sign,
            house: g.house,
            retrograde: g.retrograde,
          })),
        }
      : null,
    numerology: dataset.numerology,
    palmistry: dataset.palmistry,
    aura: dataset.aura,
  }
}

