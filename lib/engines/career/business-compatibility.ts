/**
 * User-Asked Business Compatibility Engine
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 4
 * 
 * Analyzes compatibility of a specific business idea with user's chart
 */

import { analyzeBusinessNature } from './business-nature'

export interface BusinessCompatibility {
  businessName: string
  businessType: string
  compatibility: number
  analysis: {
    kundali: {
      score: number
      reasoning: string
      planets: string[]
    }
    numerology: {
      score: number
      reasoning: string
    }
    overall: {
      score: number
      recommendation: 'highly-recommended' | 'recommended' | 'moderate' | 'not-recommended'
      reasoning: string
    }
  }
  timing: {
    bestMonths: string[]
    bestDasha: string[]
    warnings: string[]
  }
  recommendations: string[]
  challenges: string[]
}

/**
 * Analyze business compatibility for a specific business
 */
export function analyzeBusinessCompatibility(
  businessName: string,
  businessType: string,
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): BusinessCompatibility {
  // Analyze business nature
  const natureAnalyses = analyzeBusinessNature(kundali, numerology)
  const matchingNature = natureAnalyses.find((n) => n.type === businessType)

  // Kundali analysis
  const kundaliAnalysis = analyzeKundaliCompatibility(businessType, kundali)

  // Numerology analysis
  const numerologyAnalysis = analyzeNumerologyCompatibility(businessType, numerology)

  // Calculate overall compatibility
  const overallScore = (kundaliAnalysis.score + numerologyAnalysis.score) / 2
  const recommendation = getRecommendation(overallScore)

  // Timing analysis
  const timing = analyzeBusinessTiming(kundali)

  // Generate recommendations and challenges
  const recommendations = generateBusinessRecommendations(businessType, kundali, numerology)
  const challenges = generateBusinessChallenges(businessType, kundali)

  return {
    businessName,
    businessType,
    compatibility: overallScore,
    analysis: {
      kundali: kundaliAnalysis,
      numerology: numerologyAnalysis,
      overall: {
        score: overallScore,
        recommendation,
        reasoning: getOverallReasoning(overallScore, kundaliAnalysis, numerologyAnalysis),
      },
    },
    timing,
    recommendations,
    challenges,
  }
}

/**
 * Analyze Kundali compatibility
 */
function analyzeKundaliCompatibility(
  businessType: string,
  kundali: any
): { score: number; reasoning: string; planets: string[] } {
  let score = 50
  const planets: string[] = []
  let reasoning = ''

  const sun = kundali.grahas.sun
  const moon = kundali.grahas.moon
  const mars = kundali.grahas.mars
  const mercury = kundali.grahas.mercury
  const jupiter = kundali.grahas.jupiter
  const venus = kundali.grahas.venus
  const saturn = kundali.grahas.saturn
  const rahu = kundali.grahas.rahu

  // Business type specific analysis
  switch (businessType) {
    case 'tech':
      if (mercury?.house === 10) {
        score += 30
        planets.push('Mercury')
        reasoning += 'Mercury in 10th house supports technology businesses. '
      }
      if (rahu?.house === 10) {
        score += 20
        planets.push('Rahu')
        reasoning += 'Rahu influence supports innovation. '
      }
      break

    case 'fire':
      if (sun?.house === 10 || mars?.house === 10) {
        score += 30
        planets.push('Sun', 'Mars')
        reasoning += 'Sun and Mars support fire-based businesses. '
      }
      break

    case 'liquid':
      if (moon?.house === 10 || venus?.house === 10) {
        score += 30
        planets.push('Moon', 'Venus')
        reasoning += 'Moon and Venus support liquid businesses. '
      }
      break

    case 'food':
      if (venus?.house === 10 || moon?.house === 10) {
        score += 30
        planets.push('Venus', 'Moon')
        reasoning += 'Venus and Moon support food businesses. '
      }
      break

    default:
      if (jupiter?.house === 10) {
        score += 20
        planets.push('Jupiter')
        reasoning += 'Jupiter in 10th house supports business growth. '
      }
  }

  return {
    score: Math.min(score, 100),
    reasoning: reasoning || 'Moderate compatibility based on planetary positions.',
    planets,
  }
}

/**
 * Analyze numerology compatibility
 */
function analyzeNumerologyCompatibility(
  businessType: string,
  numerology?: any
): { score: number; reasoning: string } {
  if (!numerology) {
    return {
      score: 50,
      reasoning: 'Numerology data not available.',
    }
  }

  let score = 50
  let reasoning = ''

  const lifePath = numerology.lifePathNumber
  const destiny = numerology.destinyNumber

  // Business-friendly numbers
  if (lifePath === 1 || lifePath === 8) {
    score += 20
    reasoning += 'Life Path 1 or 8 indicates strong business potential. '
  }

  if (destiny === 1 || destiny === 8) {
    score += 15
    reasoning += 'Destiny number supports business success. '
  }

  // Creative numbers for creative businesses
  if ((businessType === 'food' || businessType === 'retail') && (lifePath === 3 || lifePath === 6)) {
    score += 15
    reasoning += 'Life Path supports creative/artistic businesses. '
  }

  return {
    score: Math.min(score, 100),
    reasoning: reasoning || 'Moderate numerology compatibility.',
  }
}

/**
 * Get recommendation level
 */
function getRecommendation(score: number): 'highly-recommended' | 'recommended' | 'moderate' | 'not-recommended' {
  if (score >= 80) return 'highly-recommended'
  if (score >= 65) return 'recommended'
  if (score >= 50) return 'moderate'
  return 'not-recommended'
}

/**
 * Get overall reasoning
 */
function getOverallReasoning(
  score: number,
  kundali: any,
  numerology: any
): string {
  if (score >= 80) {
    return 'Excellent compatibility! This business aligns well with your astrological profile.'
  }
  if (score >= 65) {
    return 'Good compatibility. This business has potential with proper planning.'
  }
  if (score >= 50) {
    return 'Moderate compatibility. Consider additional factors before proceeding.'
  }
  return 'Low compatibility. This business may face challenges based on your chart.'
}

/**
 * Analyze business timing
 */
function analyzeBusinessTiming(kundali: any): {
  bestMonths: string[]
  bestDasha: string[]
  warnings: string[]
} {
  return {
    bestMonths: ['March', 'June', 'September', 'December'],
    bestDasha: ['Jupiter', 'Sun', 'Venus'],
    warnings: ['Avoid starting during Saturn Dasha', 'Be cautious during Mercury Retrograde'],
  }
}

/**
 * Generate business recommendations
 */
function generateBusinessRecommendations(
  businessType: string,
  kundali: any,
  numerology?: any
): string[] {
  const recommendations: string[] = []

  const jupiter = kundali.grahas.jupiter
  if (jupiter?.house === 10) {
    recommendations.push('Start during Jupiter Dasha for best results')
  }

  if (businessType === 'tech') {
    recommendations.push('Focus on innovation and cutting-edge solutions')
    recommendations.push('Build a strong technical team')
  }

  if (businessType === 'food') {
    recommendations.push('Emphasize quality and customer experience')
    recommendations.push('Consider location carefully')
  }

  return recommendations
}

/**
 * Generate business challenges
 */
function generateBusinessChallenges(businessType: string, kundali: any): string[] {
  const challenges: string[] = []

  const saturn = kundali.grahas.saturn
  if (saturn?.house === 10) {
    challenges.push('May face delays in business growth')
    challenges.push('Requires patience and persistence')
  }

  if (businessType === 'tech') {
    challenges.push('Rapid technology changes require adaptability')
  }

  if (businessType === 'real-estate') {
    challenges.push('Requires significant capital investment')
  }

  return challenges
}

