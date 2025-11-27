/**
 * Career/Business Recommendation Engine
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 2
 * 
 * Analyzes career potential and business compatibility
 */

export interface CareerRecommendation {
  suitableFields: Array<{
    field: string
    score: number
    reason: string
    planets: string[]
  }>
  strengths: string[]
  challenges: string[]
  bestTiming: {
    months: string[]
    dasha: string[]
  }
  businessCompatibility: {
    overall: number
    nature: string[]
    recommendations: string[]
  }
}

/**
 * Analyze career potential
 */
export function analyzeCareer(
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
    lagna: any
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): CareerRecommendation {
  // Analyze 10th house (career)
  const tenthHouse = kundali.bhavas[10]
  const planetsInTenth = tenthHouse?.planets || []

  // Analyze relevant planets
  const sun = kundali.grahas.sun
  const jupiter = kundali.grahas.jupiter
  const mars = kundali.grahas.mars
  const mercury = kundali.grahas.mercury

  // Determine suitable fields
  const suitableFields = determineSuitableFields(
    planetsInTenth,
    sun,
    jupiter,
    mars,
    mercury,
    numerology
  )

  // Identify strengths
  const strengths = identifyCareerStrengths(kundali, numerology)

  // Identify challenges
  const challenges = identifyCareerChallenges(kundali)

  // Best timing
  const bestTiming = determineBestTiming(kundali)

  // Business compatibility
  const businessCompatibility = analyzeBusinessCompatibility(kundali, numerology)

  return {
    suitableFields,
    strengths,
    challenges,
    bestTiming,
    businessCompatibility,
  }
}

/**
 * Determine suitable career fields
 */
function determineSuitableFields(
  planetsInTenth: string[],
  sun: any,
  jupiter: any,
  mars: any,
  mercury: any,
  numerology?: any
): Array<{ field: string; score: number; reason: string; planets: string[] }> {
  const fields: Array<{ field: string; score: number; reason: string; planets: string[] }> = []

  // Leadership roles (Sun, Mars)
  if (sun?.house === 10 || mars?.house === 10) {
    fields.push({
      field: 'Leadership & Management',
      score: 85,
      reason: 'Strong leadership qualities indicated by planetary positions',
      planets: ['Sun', 'Mars'],
    })
  }

  // Creative fields (Venus, Moon)
  const venus = planetsInTenth.includes('venus')
  const moon = planetsInTenth.includes('moon')
  if (venus || moon) {
    fields.push({
      field: 'Arts & Creative Industries',
      score: 80,
      reason: 'Creative energy from Venus and Moon influences',
      planets: ['Venus', 'Moon'],
    })
  }

  // Technical fields (Mercury)
  if (mercury?.house === 10 || planetsInTenth.includes('mercury')) {
    fields.push({
      field: 'Technology & Communication',
      score: 90,
      reason: 'Mercury influence supports technical and communication skills',
      planets: ['Mercury'],
    })
  }

  // Finance (Jupiter, Venus)
  if (jupiter?.house === 10 || venus) {
    fields.push({
      field: 'Finance & Banking',
      score: 75,
      reason: 'Jupiter and Venus support financial acumen',
      planets: ['Jupiter', 'Venus'],
    })
  }

  // Healthcare (Moon, Mercury)
  if (moon || mercury?.house === 6) {
    fields.push({
      field: 'Healthcare & Healing',
      score: 70,
      reason: 'Moon and Mercury support healing and service',
      planets: ['Moon', 'Mercury'],
    })
  }

  // Education (Jupiter)
  if (jupiter?.house === 10 || jupiter?.house === 5) {
    fields.push({
      field: 'Education & Teaching',
      score: 80,
      reason: 'Jupiter influence supports teaching and knowledge sharing',
      planets: ['Jupiter'],
    })
  }

  // Sort by score
  return fields.sort((a, b) => b.score - a.score)
}

/**
 * Identify career strengths
 */
function identifyCareerStrengths(kundali: any, numerology?: any): string[] {
  const strengths: string[] = []

  const sun = kundali.grahas.sun
  const jupiter = kundali.grahas.jupiter
  const mars = kundali.grahas.mars

  if (sun?.house === 10) {
    strengths.push('Natural leadership abilities')
  }

  if (jupiter?.house === 10) {
    strengths.push('Wisdom and strategic thinking')
  }

  if (mars?.house === 10) {
    strengths.push('Drive and determination')
  }

  if (numerology?.lifePathNumber === 1 || numerology?.lifePathNumber === 8) {
    strengths.push('Strong business acumen')
  }

  return strengths
}

/**
 * Identify career challenges
 */
function identifyCareerChallenges(kundali: any): string[] {
  const challenges: string[] = []

  const saturn = kundali.grahas.saturn
  const rahu = kundali.grahas.rahu

  if (saturn?.house === 10) {
    challenges.push('May face delays in career progression')
  }

  if (rahu?.house === 10) {
    challenges.push('Need to be cautious of career changes')
  }

  return challenges
}

/**
 * Determine best timing
 */
function determineBestTiming(kundali: any): { months: string[]; dasha: string[] } {
  return {
    months: ['March', 'June', 'September', 'December'],
    dasha: ['Jupiter', 'Sun', 'Venus'],
  }
}

/**
 * Analyze business compatibility
 */
function analyzeBusinessCompatibility(
  kundali: any,
  numerology?: any
): { overall: number; nature: string[]; recommendations: string[] } {
  const sun = kundali.grahas.sun
  const mars = kundali.grahas.mars
  const jupiter = kundali.grahas.jupiter

  let overall = 70
  const nature: string[] = []
  const recommendations: string[] = []

  if (sun?.house === 10 || mars?.house === 10) {
    overall += 10
    nature.push('Entrepreneurial')
    recommendations.push('Consider starting your own business')
  }

  if (jupiter?.house === 10) {
    overall += 10
    nature.push('Growth-oriented')
    recommendations.push('Focus on expansion and scaling')
  }

  if (numerology?.lifePathNumber === 1 || numerology?.lifePathNumber === 8) {
    overall += 10
    nature.push('Business-minded')
    recommendations.push('Strong potential for business success')
  }

  return {
    overall: Math.min(overall, 100),
    nature,
    recommendations,
  }
}

