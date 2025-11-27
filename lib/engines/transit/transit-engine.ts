/**
 * Transit Alerts Engine
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 3
 * 
 * Detects important planetary transits and their impact
 */

export interface Transit {
  planet: string
  event: string
  date: Date
  impact: 'low' | 'medium' | 'strong'
  description: string
  affectedHouses: number[]
  recommendation: string
}

export interface UserTransit {
  transit: Transit
  personalImpact: string
  affectedAreas: string[]
}

/**
 * Get upcoming transits for next 7 days
 */
export async function getUpcomingTransits(
  startDate: Date = new Date(),
  days: number = 7
): Promise<Transit[]> {
  const transits: Transit[] = []
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + days)
  
  // This is a simplified implementation
  // In production, use actual ephemeris calculations
  
  // Example: Mercury Retrograde detection (simplified)
  const mercuryRetrograde = detectMercuryRetrograde(startDate, endDate)
  if (mercuryRetrograde) {
    transits.push(mercuryRetrograde)
  }
  
  // Example: Major planet transits (simplified)
  const majorTransits = detectMajorTransits(startDate, endDate)
  transits.push(...majorTransits)
  
  return transits
}

/**
 * Match transits with user's Kundali
 */
export function matchTransitsWithKundali(
  transits: Transit[],
  userKundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  }
): UserTransit[] {
  return transits.map((transit) => {
    const affectedHouses = transit.affectedHouses || []
    const affectedAreas = affectedHouses.map((houseNum) => {
      const bhava = userKundali.bhavas[houseNum]
      return bhava ? getHouseArea(houseNum) : ''
    }).filter(Boolean)
    
    const personalImpact = calculatePersonalImpact(transit, userKundali)
    
    return {
      transit,
      personalImpact,
      affectedAreas,
    }
  })
}

/**
 * Detect Mercury Retrograde (simplified)
 */
function detectMercuryRetrograde(startDate: Date, endDate: Date): Transit | null {
  // Simplified: Mercury retrograde happens ~3 times per year
  // In production, use actual ephemeris calculations
  const today = new Date()
  const daysSinceJan1 = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24))
  
  // Approximate retrograde periods (this is simplified)
  const retrogradePeriods = [
    { start: 30, end: 50 },   // Jan-Feb
    { start: 120, end: 140 }, // May
    { start: 250, end: 270 }, // Sep
  ]
  
  for (const period of retrogradePeriods) {
    if (daysSinceJan1 >= period.start && daysSinceJan1 <= period.end) {
      return {
        planet: 'Mercury',
        event: 'Mercury Retrograde',
        date: new Date(),
        impact: 'medium',
        description: 'Mercury is retrograde. Communication and technology may be affected.',
        affectedHouses: [3, 6, 10], // Communication, work, career houses
        recommendation: 'Review contracts carefully, backup data, avoid major decisions.',
      }
    }
  }
  
  return null
}

/**
 * Detect major planet transits (simplified)
 */
function detectMajorTransits(startDate: Date, endDate: Date): Transit[] {
  const transits: Transit[] = []
  
  // This is a placeholder - in production, use actual ephemeris
  // For now, return example transits
  
  // Example: Jupiter transit (simplified)
  const jupiterTransit: Transit = {
    planet: 'Jupiter',
    event: 'Jupiter Transit',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    impact: 'strong',
    description: 'Jupiter transits bring expansion and growth opportunities.',
    affectedHouses: [1, 5, 9], // Self, creativity, spirituality
    recommendation: 'Focus on learning, spiritual growth, and positive expansion.',
  }
  transits.push(jupiterTransit)
  
  // Example: Saturn transit (simplified)
  const saturnTransit: Transit = {
    planet: 'Saturn',
    event: 'Saturn Transit',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    impact: 'medium',
    description: 'Saturn transits bring discipline and structure.',
    affectedHouses: [10, 11], // Career, gains
    recommendation: 'Work hard, be disciplined, and focus on long-term goals.',
  }
  transits.push(saturnTransit)
  
  return transits
}

/**
 * Get house area name
 */
function getHouseArea(houseNum: number): string {
  const houseAreas: Record<number, string> = {
    1: 'Self & Identity',
    2: 'Wealth & Family',
    3: 'Communication & Siblings',
    4: 'Home & Mother',
    5: 'Creativity & Children',
    6: 'Health & Service',
    7: 'Partnership & Marriage',
    8: 'Transformation & Occult',
    9: 'Spirituality & Father',
    10: 'Career & Reputation',
    11: 'Gains & Friends',
    12: 'Losses & Spirituality',
  }
  return houseAreas[houseNum] || `House ${houseNum}`
}

/**
 * Calculate personal impact
 */
function calculatePersonalImpact(
  transit: Transit,
  userKundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  }
): string {
  // Simplified impact calculation
  // In production, use actual astrological rules
  
  const planet = transit.planet.toLowerCase()
  const userPlanet = userKundali.grahas[planet]
  
  if (!userPlanet) {
    return `This transit may have a general impact on ${transit.affectedAreas.join(', ')}.`
  }
  
  // Check if transit planet aspects user's planets
  const impactLevel = transit.impact
  
  if (impactLevel === 'strong') {
    return `This transit will significantly affect your ${transit.affectedAreas.join(', ')}. Pay attention to opportunities and challenges.`
  } else if (impactLevel === 'medium') {
    return `This transit will moderately affect your ${transit.affectedAreas.join(', ')}. Stay aware and adaptable.`
  } else {
    return `This transit will have a subtle influence on your ${transit.affectedAreas.join(', ')}.`
  }
}

