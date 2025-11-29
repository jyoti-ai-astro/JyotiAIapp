/**
 * Astro Context Builder - Central Orchestrator
 * 
 * MEGA BUILD 1 - Phase 7 Core
 * Orchestrates all astro engines and normalizes into unified AstroContext
 */

import { adminDb } from '@/lib/firebase/admin'
import { kundaliEngine, type KundaliData } from '@/lib/engines/kundali-engine'
import { predictionEngine, type DailyPrediction } from '@/lib/engines/prediction-engine'
import { timelineEngine, type MonthTimeline } from '@/lib/engines/timeline-engine'
import type {
  AstroContext,
  AstroBirthData,
  AstroChartCore,
  AstroDashaSummary,
  AstroTimelineEvent,
  PlanetPosition,
  HouseData,
  DashaPeriod,
} from './astro-types'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Load birth data from Firestore user profile
 */
async function loadBirthData(userId: string): Promise<AstroBirthData | null> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  const userRef = adminDb.collection('users').doc(userId)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    return null
  }

  const userData = userSnap.data()
  if (!userData?.dob || !userData?.tob || !userData?.pob) {
    return null
  }

  return {
    dateOfBirth: userData.dob,
    timeOfBirth: userData.tob,
    timezone: userData.timezone || 'Asia/Kolkata',
    placeName: userData.pob,
    latitude: userData.lat || 0,
    longitude: userData.lng || 0,
  }
}

/**
 * Normalize KundaliData to AstroChartCore
 */
function normalizeChart(kundali: KundaliData, rashi?: string): AstroChartCore {
  const planets: PlanetPosition[] = kundali.grahas.map((g) => ({
    planet: g.planet,
    sign: g.sign,
    degree: g.degreesInSign,
    house: g.house,
    nakshatra: g.nakshatra,
    pada: g.pada,
    retrograde: g.retrograde,
    longitude: g.longitude,
  }))

  const houses: HouseData[] = kundali.houses.map((h) => ({
    houseNumber: h.houseNumber,
    sign: h.sign,
    degree: h.cuspLongitude % 30,
    lord: h.planets[0] || '', // Simplified - would need proper lord calculation
  }))

  // Extract signs
  const sunPlanet = planets.find((p) => p.planet === 'Sun')
  const moonPlanet = planets.find((p) => p.planet === 'Moon')
  const ascendantHouse = houses.find((h) => h.houseNumber === 1)

  return {
    houses,
    planets,
    ascendantSign: ascendantHouse?.sign || kundali.lagna.sign,
    moonSign: moonPlanet?.sign || rashi || '',
    sunSign: sunPlanet?.sign || '',
  }
}

/**
 * Normalize dasha data to AstroDashaSummary
 */
function normalizeDasha(kundali: KundaliData): AstroDashaSummary {
  const dasha = kundali.dasha

  const currentMahadasha: DashaPeriod = {
    planet: dasha.currentMahadasha.planet,
    startDate: dasha.currentMahadasha.startDate,
    endDate: dasha.currentMahadasha.endDate,
    theme: `Period of ${dasha.currentMahadasha.planet} influence`,
  }

  const currentAntardasha: DashaPeriod = {
    planet: dasha.currentAntardasha.planet,
    startDate: dasha.currentAntardasha.startDate,
    endDate: dasha.currentAntardasha.endDate,
    theme: `${dasha.currentAntardasha.planet} sub-period within ${dasha.currentMahadasha.planet}`,
  }

  // Generate next 3 events (simplified - would need proper dasha calculation)
  const next3Events = [
    {
      planet: dasha.currentAntardasha.planet,
      from: dasha.currentAntardasha.endDate,
      to: new Date(new Date(dasha.currentAntardasha.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      theme: `Next ${dasha.currentAntardasha.planet} period`,
    },
    {
      planet: dasha.currentMahadasha.planet,
      from: dasha.currentMahadasha.endDate,
      to: new Date(new Date(dasha.currentMahadasha.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      theme: `Next ${dasha.currentMahadasha.planet} mahadasha`,
    },
    {
      planet: 'Jupiter',
      from: new Date().toISOString(),
      to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      theme: 'Upcoming transit period',
    },
  ]

  return {
    currentMahadasha,
    currentAntardasha,
    currentPratyantardasha: dasha.currentPratyantardasha
      ? {
          planet: dasha.currentPratyantardasha.planet,
          startDate: dasha.currentPratyantardasha.startDate,
          endDate: dasha.currentPratyantardasha.endDate,
        }
      : undefined,
    next3Events,
  }
}

/**
 * Normalize timeline data to AstroTimelineEvent[]
 */
function normalizeTimeline(timeline: MonthTimeline[]): AstroTimelineEvent[] {
  const events: AstroTimelineEvent[] = []

  // Take first 6 months and extract key events
  for (const month of timeline.slice(0, 6)) {
    for (const event of month.events.slice(0, 2)) {
      // Map event category
      let focusArea: 'career' | 'love' | 'health' | 'finance' | 'spiritual' = 'spiritual'
      if (event.category === 'career') focusArea = 'career'
      else if (event.category === 'love') focusArea = 'love'
      else if (event.category === 'health') focusArea = 'health'
      else if (event.category === 'finance') focusArea = 'finance'

      // Map intensity
      let intensity: 1 | 2 | 3 | 4 | 5 = 3
      if (event.intensity === 'high') intensity = 5
      else if (event.intensity === 'medium') intensity = 3
      else intensity = 1

      events.push({
        dateRange: {
          from: event.date,
          to: new Date(new Date(event.date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        focusArea,
        intensity,
        summary: event.description,
        advice: event.remedies?.[0] || 'Maintain balance and alignment',
      })
    }
  }

  return events
}

/**
 * Derive personality tags from chart
 */
function derivePersonalityTags(chart: AstroChartCore): string[] {
  const tags: string[] = []

  // Analyze planets in houses
  const sunHouse = chart.planets.find((p) => p.planet === 'Sun')?.house
  const moonHouse = chart.planets.find((p) => p.planet === 'Moon')?.house
  const jupiterHouse = chart.planets.find((p) => p.planet === 'Jupiter')?.house

  if (sunHouse === 1 || sunHouse === 10) tags.push('leadership')
  if (moonHouse === 4 || moonHouse === 7) tags.push('emotional')
  if (jupiterHouse === 9 || jupiterHouse === 12) tags.push('spiritual')
  if (chart.ascendantSign === 'Leo' || chart.ascendantSign === 'Aries') tags.push('creative')
  if (chart.moonSign === 'Pisces' || chart.moonSign === 'Cancer') tags.push('intuitive')

  return tags.length > 0 ? tags : ['balanced', 'spiritual']
}

/**
 * Derive risk flags from chart and predictions
 */
function deriveRiskFlags(chart: AstroChartCore, predictions: DailyPrediction): string[] {
  const flags: string[] = []

  // Check for challenging planetary positions
  const saturnHouse = chart.planets.find((p) => p.planet === 'Saturn')?.house
  if (saturnHouse === 6 || saturnHouse === 8) flags.push('health_caution')

  // Check prediction scores
  const lowScorePredictions = predictions.predictions.filter((p) => p.score < 50)
  if (lowScorePredictions.some((p) => p.category === 'money')) flags.push('financial_care')
  if (lowScorePredictions.some((p) => p.category === 'health')) flags.push('wellness_focus')

  return flags
}

/**
 * Build complete AstroContext for a user
 */
export async function buildAstroContext(
  userId: string,
  options?: { forceRefresh?: boolean }
): Promise<AstroContext | null> {
  if (!adminDb) {
    throw new Error('Firestore not initialized')
  }

  // Check cache first (unless force refresh)
  if (!options?.forceRefresh) {
    const cached = await getCachedAstroContext(userId)
    if (cached) {
      return cached
    }
  }

  // Load birth data
  const birthData = await loadBirthData(userId)
  if (!birthData) {
    return null // User hasn't completed onboarding
  }

  // Get user's rashi for context
  const userRef = adminDb.collection('users').doc(userId)
  const userSnap = await userRef.get()
  const userData = userSnap.exists ? userSnap.data() : null
  const rashi = userData?.rashi || userData?.rashiMoon || ''

  // Call existing engines (do NOT change their math)
  const kundali = await kundaliEngine.generateKundali(
    birthData.dateOfBirth,
    birthData.timeOfBirth,
    birthData.placeName
  )

  const predictions = await predictionEngine.getDailyPrediction(rashi || 'Aries')

  const timeline = await timelineEngine.generate12MonthTimeline(birthData.dateOfBirth, rashi)

  // Normalize into AstroContext
  const coreChart = normalizeChart(kundali, rashi)
  const dasha = normalizeDasha(kundali)
  const timelineEvents = normalizeTimeline(timeline)
  const personalityTags = derivePersonalityTags(coreChart)
  const riskFlags = deriveRiskFlags(coreChart, predictions)

  const context: AstroContext = {
    birthData,
    coreChart,
    dasha,
    timeline: timelineEvents,
    personalityTags,
    riskFlags,
    cachedAt: new Date().toISOString(),
  }

  // Cache in Firestore
  const contextRef = adminDb.collection('users').doc(userId).collection('astroContext').doc('current')
  await contextRef.set({
    ...context,
    cachedAt: adminDb.Timestamp.now(),
  })

  return context
}

/**
 * Get cached AstroContext if available and not too old
 */
export async function getCachedAstroContext(userId: string): Promise<AstroContext | null> {
  if (!adminDb) {
    return null
  }

  try {
    const contextRef = adminDb.collection('users').doc(userId).collection('astroContext').doc('current')
    const contextSnap = await contextRef.get()

    if (!contextSnap.exists) {
      return null
    }

    const data = contextSnap.data()
    if (!data) {
      return null
    }

    // Check if cache is still valid
    const cachedAt = data.cachedAt?.toDate?.() || new Date(data.cachedAt || 0)
    const age = Date.now() - cachedAt.getTime()

    if (age > CACHE_TTL_MS) {
      return null // Cache expired
    }

    // Convert Firestore Timestamp to ISO string if needed
    return {
      ...data,
      cachedAt: cachedAt.toISOString(),
    } as AstroContext
  } catch (error) {
    console.error('Error getting cached astro context:', error)
    return null
  }
}

