/**
 * Astro-Location Engine
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 7
 * 
 * Analyzes favorable locations based on astrological factors
 */

export interface LocationAnalysis {
  location: string
  coordinates?: { lat: number; lng: number }
  compatibility: number
  reasoning: string
  favorableDirections: string[]
  favorableElements: string[]
  recommendations: string[]
  challenges: string[]
}

/**
 * Analyze location compatibility
 */
export function analyzeLocation(
  location: string,
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
    lagna: any
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): LocationAnalysis {
  // Determine direction based on location (simplified)
  const direction = getDirectionFromLocation(location)

  // Analyze direction compatibility
  const directionCompatibility = analyzeDirectionCompatibility(direction, kundali)

  // Analyze element compatibility
  const elementCompatibility = analyzeElementCompatibility(location, kundali)

  // Calculate overall compatibility
  const compatibility = (directionCompatibility + elementCompatibility) / 2

  // Generate insights
  const favorableDirections = getFavorableDirections(kundali)
  const favorableElements = getFavorableElements(kundali)
  const recommendations = generateLocationRecommendations(compatibility, direction, kundali)
  const challenges = generateLocationChallenges(compatibility, direction)

  return {
    location,
    compatibility: Math.round(compatibility),
    reasoning: getLocationReasoning(compatibility, direction, kundali),
    favorableDirections,
    favorableElements,
    recommendations,
    challenges,
  }
}

/**
 * Get direction from location (simplified)
 */
function getDirectionFromLocation(location: string): string {
  // Simplified - in production, use geocoding to determine actual direction
  const locationLower = location.toLowerCase()

  if (locationLower.includes('east') || locationLower.includes('delhi') || locationLower.includes('kolkata')) {
    return 'east'
  }
  if (locationLower.includes('west') || locationLower.includes('mumbai') || locationLower.includes('pune')) {
    return 'west'
  }
  if (locationLower.includes('north') || locationLower.includes('chandigarh') || locationLower.includes('jammu')) {
    return 'north'
  }
  if (locationLower.includes('south') || locationLower.includes('chennai') || locationLower.includes('bangalore')) {
    return 'south'
  }

  return 'center'
}

/**
 * Analyze direction compatibility
 */
function analyzeDirectionCompatibility(direction: string, kundali: any): number {
  const lagna = kundali.lagna?.sign
  if (!lagna) return 50

  // Direction to sign mapping (simplified)
  const directionSigns: Record<string, string[]> = {
    east: ['Aries', 'Leo', 'Sagittarius'],
    west: ['Libra', 'Aquarius', 'Gemini'],
    north: ['Taurus', 'Virgo', 'Capricorn'],
    south: ['Cancer', 'Scorpio', 'Pisces'],
  }

  const favorableSigns = directionSigns[direction] || []
  if (favorableSigns.includes(lagna)) {
    return 85
  }

  return 60
}

/**
 * Analyze element compatibility
 */
function analyzeElementCompatibility(location: string, kundali: any): number {
  const moon = kundali.grahas.moon
  const moonSign = moon?.sign
  if (!moonSign) return 50

  // Element mapping
  const signElements: Record<string, string> = {
    Aries: 'fire',
    Leo: 'fire',
    Sagittarius: 'fire',
    Taurus: 'earth',
    Virgo: 'earth',
    Capricorn: 'earth',
    Gemini: 'air',
    Libra: 'air',
    Aquarius: 'air',
    Cancer: 'water',
    Scorpio: 'water',
    Pisces: 'water',
  }

  const moonElement = signElements[moonSign]

  // Location element (simplified)
  const locationLower = location.toLowerCase()
  let locationElement = 'earth' // default

  if (locationLower.includes('coast') || locationLower.includes('beach') || locationLower.includes('river')) {
    locationElement = 'water'
  } else if (locationLower.includes('mountain') || locationLower.includes('hill')) {
    locationElement = 'earth'
  } else if (locationLower.includes('desert') || locationLower.includes('hot')) {
    locationElement = 'fire'
  }

  if (moonElement === locationElement) {
    return 80
  }

  // Compatible elements
  const compatibleElements: Record<string, string[]> = {
    fire: ['air'],
    earth: ['water'],
    air: ['fire'],
    water: ['earth'],
  }

  if (compatibleElements[moonElement]?.includes(locationElement)) {
    return 70
  }

  return 55
}

/**
 * Get favorable directions
 */
function getFavorableDirections(kundali: any): string[] {
  const lagna = kundali.lagna?.sign
  if (!lagna) return []

  const directionMap: Record<string, string[]> = {
    Aries: ['east', 'north'],
    Taurus: ['north', 'west'],
    Gemini: ['west', 'south'],
    Cancer: ['south', 'east'],
    Leo: ['east', 'north'],
    Virgo: ['north', 'west'],
    Libra: ['west', 'south'],
    Scorpio: ['south', 'east'],
    Sagittarius: ['east', 'north'],
    Capricorn: ['north', 'west'],
    Aquarius: ['west', 'south'],
    Pisces: ['south', 'east'],
  }

  return directionMap[lagna] || []
}

/**
 * Get favorable elements
 */
function getFavorableElements(kundali: any): string[] {
  const moon = kundali.grahas.moon
  const moonSign = moon?.sign
  if (!moonSign) return []

  const signElements: Record<string, string> = {
    Aries: 'fire',
    Leo: 'fire',
    Sagittarius: 'fire',
    Taurus: 'earth',
    Virgo: 'earth',
    Capricorn: 'earth',
    Gemini: 'air',
    Libra: 'air',
    Aquarius: 'air',
    Cancer: 'water',
    Scorpio: 'water',
    Pisces: 'water',
  }

  const moonElement = signElements[moonSign]
  const compatibleElements: Record<string, string[]> = {
    fire: ['fire', 'air'],
    earth: ['earth', 'water'],
    air: ['air', 'fire'],
    water: ['water', 'earth'],
  }

  return compatibleElements[moonElement] || [moonElement]
}

/**
 * Generate location recommendations
 */
function generateLocationRecommendations(
  compatibility: number,
  direction: string,
  kundali: any
): string[] {
  const recommendations: string[] = []

  if (compatibility >= 75) {
    recommendations.push(`This location is highly favorable for you`)
    recommendations.push(`Consider relocating or spending more time here`)
  } else if (compatibility >= 60) {
    recommendations.push(`This location has moderate compatibility`)
    recommendations.push(`Consider visiting before making major decisions`)
  } else {
    recommendations.push(`This location may not be ideal`)
    recommendations.push(`Consider other directions or locations`)
  }

  const favorableDirections = getFavorableDirections(kundali)
  if (favorableDirections.includes(direction)) {
    recommendations.push(`Direction ${direction} is favorable for your chart`)
  }

  return recommendations
}

/**
 * Generate location challenges
 */
function generateLocationChallenges(compatibility: number, direction: string): string[] {
  const challenges: string[] = []

  if (compatibility < 60) {
    challenges.push('May face challenges adapting to this location')
    challenges.push('Consider Vastu remedies if relocating')
  }

  return challenges
}

/**
 * Get location reasoning
 */
function getLocationReasoning(compatibility: number, direction: string, kundali: any): string {
  if (compatibility >= 75) {
    return `Excellent compatibility! This location aligns well with your astrological profile. The ${direction} direction and elemental energies support your growth.`
  }
  if (compatibility >= 60) {
    return `Moderate compatibility. This location has some favorable aspects but may require adjustments.`
  }
  return `Low compatibility. This location may not be ideal based on your chart. Consider other directions or locations.`
}

