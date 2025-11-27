/**
 * Timeline Engine (12-Month Timeline)
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 1
 * 
 * Generates 12-month predictive timeline based on Dasha, transits, and planetary positions
 */

// Dasha type definition
interface DashaCalculation {
  currentMahadasha: {
    planet: string
    startDate: Date | string
    endDate: Date | string
    subPeriods?: Array<{
      planet: string
      startDate: Date | string
      endDate: Date | string
    }>
  }
  currentAntardasha?: {
    planet: string
    startDate: Date | string
    endDate: Date | string
  }
}

export interface TimelineEvent {
  month: string
  date: Date
  event: string
  category: 'career' | 'love' | 'health' | 'wealth' | 'spiritual' | 'family'
  significance: 'low' | 'medium' | 'high'
  description: string
  recommendation: string
  planetaryInfluence: string[]
}

export interface Timeline {
  startDate: Date
  endDate: Date
  events: TimelineEvent[]
  summary: {
    overallEnergy: 'low' | 'medium' | 'high'
    bestMonths: string[]
    challengingMonths: string[]
    keyThemes: string[]
  }
}

/**
 * Generate 12-month timeline
 */
export function generateTimeline(
  dasha: DashaCalculation,
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): Timeline {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 12)

  const events: TimelineEvent[] = []
  const months: string[] = []
  const themes: Set<string> = new Set()

  // Generate events for each month
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(startDate)
    monthDate.setMonth(monthDate.getMonth() + i)
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })

    months.push(monthName)

    // Determine which Dasha period this month falls into
    const currentDasha = getDashaForDate(monthDate, dasha)
    
    // Generate events based on Dasha and planetary positions
    const monthEvents = generateMonthEvents(monthDate, currentDasha, kundali, numerology)
    events.push(...monthEvents)

    // Collect themes
    monthEvents.forEach((event) => {
      themes.add(event.category)
    })
  }

  // Calculate summary
  const bestMonths = identifyBestMonths(events)
  const challengingMonths = identifyChallengingMonths(events)
  const overallEnergy = calculateOverallEnergy(events)

  return {
    startDate,
    endDate,
    events,
    summary: {
      overallEnergy,
      bestMonths,
      challengingMonths,
      keyThemes: Array.from(themes),
    },
  }
}

/**
 * Get Dasha period for a specific date
 */
function getDashaForDate(date: Date, dasha: DashaCalculation): string {
  // Check if date falls within current Mahadasha
  const mahadashaStart = new Date(dasha.currentMahadasha.startDate)
  const mahadashaEnd = new Date(dasha.currentMahadasha.endDate)

  if (date >= mahadashaStart && date <= mahadashaEnd) {
    return dasha.currentMahadasha.planet
  }

  // Check Antar Dashas
  if (dasha.currentMahadasha.subPeriods) {
    for (const antardasha of dasha.currentMahadasha.subPeriods) {
      const antardashaStart = new Date(antardasha.startDate)
      const antardashaEnd = new Date(antardasha.endDate)

      if (date >= antardashaStart && date <= antardashaEnd) {
        return `${dasha.currentMahadasha.planet}-${antardasha.planet}`
      }
    }
  }

  return dasha.currentMahadasha.planet
}

/**
 * Generate events for a specific month
 */
function generateMonthEvents(
  monthDate: Date,
  dasha: string,
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): TimelineEvent[] {
  const events: TimelineEvent[] = []
  const monthName = monthDate.toLocaleString('default', { month: 'long' })

  // Career events (based on 10th house and Dasha)
  const careerEvent = generateCareerEvent(monthDate, monthName, dasha, kundali)
  if (careerEvent) events.push(careerEvent)

  // Love/Relationship events (based on 7th house and Venus)
  const loveEvent = generateLoveEvent(monthDate, monthName, dasha, kundali)
  if (loveEvent) events.push(loveEvent)

  // Wealth events (based on 2nd and 11th houses)
  const wealthEvent = generateWealthEvent(monthDate, monthName, dasha, kundali)
  if (wealthEvent) events.push(wealthEvent)

  // Health events (based on 6th house and Moon)
  const healthEvent = generateHealthEvent(monthDate, monthName, dasha, kundali)
  if (healthEvent) events.push(healthEvent)

  // Spiritual events (based on 9th and 12th houses)
  const spiritualEvent = generateSpiritualEvent(monthDate, monthName, dasha, kundali)
  if (spiritualEvent) events.push(spiritualEvent)

  return events
}

/**
 * Generate career event
 */
function generateCareerEvent(
  date: Date,
  monthName: string,
  dasha: string,
  kundali: any
): TimelineEvent | null {
  // Simplified logic - in production, use actual astrological calculations
  const isFavorable = dasha.includes('Jupiter') || dasha.includes('Sun') || dasha.includes('Mars')

  return {
    month: monthName,
    date,
    event: isFavorable ? 'Career Growth Opportunity' : 'Career Stability Period',
    category: 'career',
    significance: isFavorable ? 'high' : 'medium',
    description: isFavorable
      ? 'Favorable planetary positions indicate growth opportunities in your career.'
      : 'A period of stability and consolidation in professional matters.',
    recommendation: isFavorable
      ? 'Take calculated risks, network actively, and pursue new opportunities.'
      : 'Focus on building skills and maintaining current position.',
    planetaryInfluence: ['Jupiter', 'Sun'],
  }
}

/**
 * Generate love event
 */
function generateLoveEvent(
  date: Date,
  monthName: string,
  dasha: string,
  kundali: any
): TimelineEvent | null {
  const isFavorable = dasha.includes('Venus') || dasha.includes('Moon')

  return {
    month: monthName,
    date,
    event: isFavorable ? 'Harmony in Relationships' : 'Relationship Reflection Period',
    category: 'love',
    significance: isFavorable ? 'high' : 'medium',
    description: isFavorable
      ? 'Venus and Moon influences bring harmony and emotional connection.'
      : 'A time for reflection and understanding in relationships.',
    recommendation: isFavorable
      ? 'Express your feelings openly and strengthen bonds.'
      : 'Communicate clearly and work on understanding.',
    planetaryInfluence: ['Venus', 'Moon'],
  }
}

/**
 * Generate wealth event
 */
function generateWealthEvent(
  date: Date,
  monthName: string,
  dasha: string,
  kundali: any
): TimelineEvent | null {
  const isFavorable = dasha.includes('Jupiter') || dasha.includes('Venus')

  return {
    month: monthName,
    date,
    event: isFavorable ? 'Financial Growth' : 'Financial Planning Period',
    category: 'wealth',
    significance: isFavorable ? 'high' : 'medium',
    description: isFavorable
      ? 'Jupiter and Venus influences indicate financial growth opportunities.'
      : 'A period for careful financial planning and management.',
    recommendation: isFavorable
      ? 'Invest wisely and explore new income sources.'
      : 'Save diligently and avoid unnecessary expenses.',
    planetaryInfluence: ['Jupiter', 'Venus'],
  }
}

/**
 * Generate health event
 */
function generateHealthEvent(
  date: Date,
  monthName: string,
  dasha: string,
  kundali: any
): TimelineEvent | null {
  return {
    month: monthName,
    date,
    event: 'Health Maintenance',
    category: 'health',
    significance: 'medium',
    description: 'Maintain regular exercise and balanced diet for optimal health.',
    recommendation: 'Practice yoga, meditation, and maintain regular health checkups.',
    planetaryInfluence: ['Moon', 'Mars'],
  }
}

/**
 * Generate spiritual event
 */
function generateSpiritualEvent(
  date: Date,
  monthName: string,
  dasha: string,
  kundali: any
): TimelineEvent | null {
  const isFavorable = dasha.includes('Jupiter') || dasha.includes('Saturn')

  return {
    month: monthName,
    date,
    event: isFavorable ? 'Spiritual Growth' : 'Spiritual Reflection',
    category: 'spiritual',
    significance: isFavorable ? 'high' : 'medium',
    description: isFavorable
      ? 'Jupiter and Saturn influences support spiritual growth and wisdom.'
      : 'A time for inner reflection and spiritual practices.',
    recommendation: isFavorable
      ? 'Engage in spiritual practices, meditation, and study sacred texts.'
      : 'Maintain daily spiritual routine and seek inner peace.',
    planetaryInfluence: ['Jupiter', 'Saturn'],
  }
}

/**
 * Identify best months
 */
function identifyBestMonths(events: TimelineEvent[]): string[] {
  const monthScores: Record<string, number> = {}

  events.forEach((event) => {
    if (!monthScores[event.month]) {
      monthScores[event.month] = 0
    }

    const score = event.significance === 'high' ? 3 : event.significance === 'medium' ? 2 : 1
    monthScores[event.month] += score
  })

  return Object.entries(monthScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([month]) => month)
}

/**
 * Identify challenging months
 */
function identifyChallengingMonths(events: TimelineEvent[]): string[] {
  // Months with health or low-significance events
  const challengingMonths = new Set<string>()

  events.forEach((event) => {
    if (event.category === 'health' || event.significance === 'low') {
      challengingMonths.add(event.month)
    }
  })

  return Array.from(challengingMonths).slice(0, 3)
}

/**
 * Calculate overall energy
 */
function calculateOverallEnergy(events: TimelineEvent[]): 'low' | 'medium' | 'high' {
  const highCount = events.filter((e) => e.significance === 'high').length
  const totalEvents = events.length

  const highPercentage = (highCount / totalEvents) * 100

  if (highPercentage >= 40) return 'high'
  if (highPercentage >= 20) return 'medium'
  return 'low'
}

