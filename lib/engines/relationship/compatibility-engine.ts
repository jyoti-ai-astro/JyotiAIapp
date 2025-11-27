/**
 * Relationship Compatibility Engine
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 6
 * 
 * Analyzes compatibility between two people for marriage/relationships
 */

export interface CompatibilityAnalysis {
  overall: number
  categories: {
    emotional: number
    intellectual: number
    physical: number
    spiritual: number
    financial: number
  }
  strengths: string[]
  challenges: string[]
  recommendations: string[]
  dashaCompatibility: {
    current: string
    future: string[]
  }
  remedies: string[]
}

/**
 * Analyze relationship compatibility
 */
export function analyzeCompatibility(
  person1: {
    kundali: {
      grahas: Record<string, any>
      bhavas: Record<string, any>
      lagna: any
    }
    numerology?: {
      lifePathNumber: number
      destinyNumber: number
    }
  },
  person2: {
    kundali: {
      grahas: Record<string, any>
      bhavas: Record<string, any>
      lagna: any
    }
    numerology?: {
      lifePathNumber: number
      destinyNumber: number
    }
  }
): CompatibilityAnalysis {
  // Rashi compatibility
  const rashiCompatibility = analyzeRashiCompatibility(
    person1.kundali.grahas.moon?.sign,
    person2.kundali.grahas.moon?.sign
  )

  // Nakshatra compatibility
  const nakshatraCompatibility = analyzeNakshatraCompatibility(
    person1.kundali.grahas.moon?.nakshatra,
    person2.kundali.grahas.moon?.nakshatra
  )

  // Lagna compatibility
  const lagnaCompatibility = analyzeLagnaCompatibility(
    person1.kundali.lagna?.sign,
    person2.kundali.lagna?.sign
  )

  // Planet compatibility
  const planetCompatibility = analyzePlanetCompatibility(
    person1.kundali.grahas,
    person2.kundali.grahas
  )

  // Numerology compatibility
  const numerologyCompatibility = analyzeNumerologyCompatibility(
    person1.numerology,
    person2.numerology
  )

  // Calculate category scores
  const emotional = (rashiCompatibility + nakshatraCompatibility) / 2
  const intellectual = planetCompatibility.mercury
  const physical = planetCompatibility.mars
  const spiritual = (lagnaCompatibility + planetCompatibility.jupiter) / 2
  const financial = planetCompatibility.venus

  // Overall score
  const overall = (emotional + intellectual + physical + spiritual + financial) / 5

  // Generate insights
  const strengths = generateStrengths(overall, emotional, spiritual)
  const challenges = generateChallenges(overall, emotional, physical)
  const recommendations = generateRecommendations(overall, emotional, spiritual)
  const remedies = generateRemedies(overall, challenges)

  // Dasha compatibility
  const dashaCompatibility = analyzeDashaCompatibility(person1, person2)

  return {
    overall: Math.round(overall),
    categories: {
      emotional: Math.round(emotional),
      intellectual: Math.round(intellectual),
      physical: Math.round(physical),
      spiritual: Math.round(spiritual),
      financial: Math.round(financial),
    },
    strengths,
    challenges,
    recommendations,
    dashaCompatibility,
    remedies,
  }
}

/**
 * Analyze Rashi compatibility
 */
function analyzeRashiCompatibility(rashi1?: string, rashi2?: string): number {
  if (!rashi1 || !rashi2) return 50

  // Compatible rashis (same element or friendly)
  const compatiblePairs: Record<string, string[]> = {
    Aries: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    Taurus: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    Gemini: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    Cancer: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    Leo: ['Sagittarius', 'Aries', 'Gemini', 'Libra'],
    Virgo: ['Capricorn', 'Taurus', 'Cancer', 'Scorpio'],
    Libra: ['Aquarius', 'Gemini', 'Leo', 'Sagittarius'],
    Scorpio: ['Pisces', 'Cancer', 'Virgo', 'Capricorn'],
    Sagittarius: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    Capricorn: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    Aquarius: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    Pisces: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
  }

  if (compatiblePairs[rashi1]?.includes(rashi2)) {
    return 85
  }

  if (rashi1 === rashi2) {
    return 70
  }

  return 50
}

/**
 * Analyze Nakshatra compatibility
 */
function analyzeNakshatraCompatibility(nakshatra1?: string, nakshatra2?: string): number {
  if (!nakshatra1 || !nakshatra2) return 50

  // Simplified - in production, use proper Nakshatra compatibility rules
  if (nakshatra1 === nakshatra2) {
    return 75
  }

  return 60
}

/**
 * Analyze Lagna compatibility
 */
function analyzeLagnaCompatibility(lagna1?: string, lagna2?: string): number {
  if (!lagna1 || !lagna2) return 50

  // Compatible lagnas
  const compatiblePairs: Record<string, string[]> = {
    Aries: ['Leo', 'Sagittarius'],
    Taurus: ['Virgo', 'Capricorn'],
    Gemini: ['Libra', 'Aquarius'],
    Cancer: ['Scorpio', 'Pisces'],
    Leo: ['Sagittarius', 'Aries'],
    Virgo: ['Capricorn', 'Taurus'],
    Libra: ['Aquarius', 'Gemini'],
    Scorpio: ['Pisces', 'Cancer'],
    Sagittarius: ['Aries', 'Leo'],
    Capricorn: ['Taurus', 'Virgo'],
    Aquarius: ['Gemini', 'Libra'],
    Pisces: ['Cancer', 'Scorpio'],
  }

  if (compatiblePairs[lagna1]?.includes(lagna2)) {
    return 80
  }

  return 55
}

/**
 * Analyze planet compatibility
 */
function analyzePlanetCompatibility(
  grahas1: Record<string, any>,
  grahas2: Record<string, any>
): Record<string, number> {
  const compatibility: Record<string, number> = {
    mercury: 50,
    mars: 50,
    venus: 50,
    jupiter: 50,
  }

  // Mercury (intellectual)
  const mercury1 = grahas1.mercury?.sign
  const mercury2 = grahas2.mercury?.sign
  if (mercury1 && mercury2) {
    compatibility.mercury = analyzeSignCompatibility(mercury1, mercury2)
  }

  // Mars (physical)
  const mars1 = grahas1.mars?.sign
  const mars2 = grahas2.mars?.sign
  if (mars1 && mars2) {
    compatibility.mars = analyzeSignCompatibility(mars1, mars2)
  }

  // Venus (love, finances)
  const venus1 = grahas1.venus?.sign
  const venus2 = grahas2.venus?.sign
  if (venus1 && venus2) {
    compatibility.venus = analyzeSignCompatibility(venus1, venus2)
  }

  // Jupiter (spiritual)
  const jupiter1 = grahas1.jupiter?.sign
  const jupiter2 = grahas2.jupiter?.sign
  if (jupiter1 && jupiter2) {
    compatibility.jupiter = analyzeSignCompatibility(jupiter1, jupiter2)
  }

  return compatibility
}

/**
 * Analyze sign compatibility
 */
function analyzeSignCompatibility(sign1: string, sign2: string): number {
  if (sign1 === sign2) return 70

  const elements: Record<string, string> = {
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

  const element1 = elements[sign1]
  const element2 = elements[sign2]

  if (element1 === element2) return 80

  // Compatible elements
  const compatibleElements: Record<string, string[]> = {
    fire: ['air'],
    earth: ['water'],
    air: ['fire'],
    water: ['earth'],
  }

  if (compatibleElements[element1]?.includes(element2)) {
    return 75
  }

  return 50
}

/**
 * Analyze numerology compatibility
 */
function analyzeNumerologyCompatibility(
  numerology1?: any,
  numerology2?: any
): number {
  if (!numerology1 || !numerology2) return 50

  const lifePath1 = numerology1.lifePathNumber
  const lifePath2 = numerology2.lifePathNumber

  // Compatible life path numbers
  const compatiblePairs: Record<number, number[]> = {
    1: [1, 5, 7],
    2: [2, 4, 8],
    3: [3, 6, 9],
    4: [2, 4, 8],
    5: [1, 5, 7],
    6: [3, 6, 9],
    7: [1, 5, 7],
    8: [2, 4, 8],
    9: [3, 6, 9],
  }

  if (compatiblePairs[lifePath1]?.includes(lifePath2)) {
    return 85
  }

  if (lifePath1 === lifePath2) {
    return 70
  }

  return 55
}

/**
 * Generate strengths
 */
function generateStrengths(overall: number, emotional: number, spiritual: number): string[] {
  const strengths: string[] = []

  if (emotional >= 75) {
    strengths.push('Strong emotional connection and understanding')
  }

  if (spiritual >= 75) {
    strengths.push('Shared spiritual values and growth')
  }

  if (overall >= 80) {
    strengths.push('Excellent overall compatibility')
  } else if (overall >= 65) {
    strengths.push('Good compatibility with potential for growth')
  }

  return strengths
}

/**
 * Generate challenges
 */
function generateChallenges(overall: number, emotional: number, physical: number): string[] {
  const challenges: string[] = []

  if (emotional < 60) {
    challenges.push('May need to work on emotional communication')
  }

  if (physical < 60) {
    challenges.push('Physical compatibility may require attention')
  }

  if (overall < 60) {
    challenges.push('Overall compatibility may require effort and understanding')
  }

  return challenges
}

/**
 * Generate recommendations
 */
function generateRecommendations(overall: number, emotional: number, spiritual: number): string[] {
  const recommendations: string[] = []

  if (emotional < 70) {
    recommendations.push('Focus on open communication and emotional expression')
  }

  if (spiritual >= 75) {
    recommendations.push('Engage in spiritual practices together')
  }

  if (overall >= 70) {
    recommendations.push('This relationship has good potential with mutual effort')
  } else {
    recommendations.push('Consider compatibility remedies and mutual understanding')
  }

  return recommendations
}

/**
 * Generate remedies
 */
function generateRemedies(overall: number, challenges: string[]): string[] {
  const remedies: string[] = []

  if (overall < 70) {
    remedies.push('Perform Ganesha Puja together for harmony')
    remedies.push('Wear compatible gemstones')
    remedies.push('Chant relationship mantras together')
  }

  if (challenges.some((c) => c.includes('emotional'))) {
    remedies.push('Perform Venus remedies for emotional harmony')
  }

  return remedies
}

/**
 * Analyze Dasha compatibility
 */
function analyzeDashaCompatibility(person1: any, person2: any): {
  current: string
  future: string[]
} {
  // Simplified - in production, analyze actual Dasha periods
  return {
    current: 'Compatible Dasha periods',
    future: ['Jupiter-Jupiter', 'Venus-Venus'],
  }
}

