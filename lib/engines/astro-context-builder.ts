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
  AstroDashaPeriod,
  AstroTransitEvent,
  AstroLifeTheme,
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

  // Super Phase B - Compute enhanced fields
  let dashaTimeline: AstroDashaPeriod[] = []
  let transitEvents: AstroTransitEvent[] = []
  let lifeThemes: AstroLifeTheme[] = []

  try {
    dashaTimeline = computeDashaTimeline(kundali, dasha)
  } catch (error) {
    console.error('Error computing dasha timeline:', error)
  }

  try {
    transitEvents = computeTransitEvents(coreChart, timelineEvents)
  } catch (error) {
    console.error('Error computing transit events:', error)
  }

  try {
    lifeThemes = deriveLifeThemes(coreChart, dasha, predictions)
  } catch (error) {
    console.error('Error deriving life themes:', error)
  }

  const context: AstroContext = {
    birthData,
    coreChart,
    dasha,
    timeline: timelineEvents,
    personalityTags,
    riskFlags,
    cachedAt: new Date().toISOString(),
    // Super Phase B - Enhanced fields
    dashaTimeline: dashaTimeline.length > 0 ? dashaTimeline : undefined,
    transitEvents: transitEvents.length > 0 ? transitEvents : undefined,
    lifeThemes: lifeThemes.length > 0 ? lifeThemes : undefined,
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
 * Compute top 3 dasha/transit events for the next 6 months
 */
function computeDashaTimeline(kundali: KundaliData, dasha: AstroDashaSummary): AstroDashaPeriod[] {
  const periods: AstroDashaPeriod[] = []
  const now = new Date()
  const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000)

  // Add current mahadasha
  if (dasha.currentMahadasha) {
    const startDate = new Date(dasha.currentMahadasha.startDate)
    const endDate = new Date(dasha.currentMahadasha.endDate)
    if (endDate > now && startDate <= sixMonthsFromNow) {
      periods.push({
        planet: dasha.currentMahadasha.planet,
        start: dasha.currentMahadasha.startDate,
        end: dasha.currentMahadasha.endDate,
        strength: 8, // High strength for mahadasha
        notes: `Major life period of ${dasha.currentMahadasha.planet} influence`,
      })
    }
  }

  // Add current antardasha
  if (dasha.currentAntardasha) {
    const startDate = new Date(dasha.currentAntardasha.startDate)
    const endDate = new Date(dasha.currentAntardasha.endDate)
    if (endDate > now && startDate <= sixMonthsFromNow) {
      periods.push({
        planet: dasha.currentAntardasha.planet,
        start: dasha.currentAntardasha.startDate,
        end: dasha.currentAntardasha.endDate,
        strength: 6, // Medium-high strength for antardasha
        notes: `Sub-period of ${dasha.currentAntardasha.planet} within ${dasha.currentMahadasha.planet}`,
      })
    }
  }

  // Add next 3 events
  for (const event of dasha.next3Events) {
    const startDate = new Date(event.from)
    if (startDate <= sixMonthsFromNow && startDate > now) {
      periods.push({
        planet: event.planet,
        start: event.from,
        end: event.to,
        strength: 5, // Medium strength for upcoming events
        notes: event.theme,
      })
    }
  }

  // Sort by start date and return top 3
  return periods.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 3)
}

/**
 * Compute upcoming transit events with strong intensity
 */
function computeTransitEvents(chart: AstroChartCore, timeline: AstroTimelineEvent[]): AstroTransitEvent[] {
  const events: AstroTransitEvent[] = []
  const now = new Date()
  const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000)

  // Extract transit events from timeline (intensity >= 4)
  for (const event of timeline) {
    if (event.intensity >= 4) {
      const startDate = new Date(event.dateRange.from)
      if (startDate <= sixMonthsFromNow && startDate > now) {
        // Map focus area to house (simplified mapping)
        const houseMap: Record<string, number> = {
          career: 10,
          love: 7,
          health: 6,
          finance: 2,
          spiritual: 9,
        }

        events.push({
          planet: 'Jupiter', // Default - would need actual transit calculation
          house: houseMap[event.focusArea] || 1,
          start: event.dateRange.from,
          end: event.dateRange.end,
          theme: event.summary,
          intensity: event.intensity,
        })
      }
    }
  }

  // Sort by start date and return top 5
  return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()).slice(0, 5)
}

/**
 * Derive 3-5 life themes with confidence scores
 */
function deriveLifeThemes(chart: AstroChartCore, dasha: AstroDashaSummary, predictions: DailyPrediction): AstroLifeTheme[] {
  const themes: AstroLifeTheme[] = []

  // Analyze chart positions
  const sunHouse = chart.planets.find((p) => p.planet === 'Sun')?.house
  const moonHouse = chart.planets.find((p) => p.planet === 'Moon')?.house
  const jupiterHouse = chart.planets.find((p) => p.planet === 'Jupiter')?.house
  const venusHouse = chart.planets.find((p) => p.planet === 'Venus')?.house

  // Career theme (10th house focus)
  if (sunHouse === 10 || jupiterHouse === 10 || dasha.currentMahadasha.planet === 'Sun' || dasha.currentMahadasha.planet === 'Jupiter') {
    const careerPred = predictions.predictions.find((p) => p.category === 'career')
    themes.push({
      area: 'career',
      confidence: careerPred ? careerPred.score : 75,
      summary: 'Strong career focus indicated by planetary positions and current dasha',
    })
  }

  // Love/Relationship theme (7th house focus)
  if (venusHouse === 7 || moonHouse === 7 || dasha.currentMahadasha.planet === 'Venus') {
    const lovePred = predictions.predictions.find((p) => p.category === 'love')
    themes.push({
      area: 'love',
      confidence: lovePred ? lovePred.score : 70,
      summary: 'Relationship harmony and growth period',
    })
  }

  // Health theme (6th house focus)
  if (moonHouse === 6 || chart.planets.some((p) => p.planet === 'Saturn' && p.house === 6)) {
    const healthPred = predictions.predictions.find((p) => p.category === 'health')
    themes.push({
      area: 'health',
      confidence: healthPred ? healthPred.score : 65,
      summary: 'Wellness focus and preventive care recommended',
    })
  }

  // Money theme (2nd house focus)
  if (jupiterHouse === 2 || venusHouse === 2 || dasha.currentMahadasha.planet === 'Jupiter') {
    const moneyPred = predictions.predictions.find((p) => p.category === 'money')
    themes.push({
      area: 'money',
      confidence: moneyPred ? moneyPred.score : 70,
      summary: 'Financial stability and growth opportunities',
    })
  }

  // Family theme (4th house focus)
  if (moonHouse === 4 || sunHouse === 4) {
    themes.push({
      area: 'family',
      confidence: 68,
      summary: 'Family harmony and domestic focus',
    })
  }

  // Sort by confidence and return top 5
  return themes.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
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

