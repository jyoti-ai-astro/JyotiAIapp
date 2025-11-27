/**
 * Prediction Consolidation Layer
 * Part B - Section 6: Reports Engine
 * Milestone 8 - Step 10
 * 
 * Merges predictions from kundali, numerology, aura, and palmistry
 */

// Prediction Report type
interface PredictionReport {
  personality: {
    overview: string
    strengths: string[]
    weaknesses: string[]
  }
  career: {
    insights: string
    recommendations: string[]
  }
  love: {
    insights: string
    recommendations: string[]
  }
  wealth: {
    insights: string
    recommendations: string[]
  }
  health: {
    insights: string
    emotional: string
    recommendations: string[]
  }
}

export interface ConsolidatedPrediction {
  personality: {
    kundali: string
    numerology: string
    aura?: string
    palmistry?: string
    merged: string
  }
  career: {
    kundali: string
    numerology: string
    merged: string
    recommendations: string[]
  }
  love: {
    kundali: string
    numerology: string
    merged: string
    recommendations: string[]
  }
  wealth: {
    kundali: string
    numerology: string
    merged: string
    recommendations: string[]
  }
  health: {
    kundali: string
    aura?: string
    palmistry?: string
    merged: string
    recommendations: string[]
  }
  spiritual: {
    kundali: string
    aura?: string
    merged: string
    recommendations: string[]
  }
  confidence: {
    score: number
    sources: string[]
  }
}

/**
 * Consolidate predictions from all sources
 */
export function consolidatePredictions(
  kundaliPredictions: PredictionReport,
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
    expressionNumber: number
  },
  aura?: {
    primaryColor: string
    energyScore: number
    chakraBalance: Record<string, number>
  },
  palmistry?: {
    overallScore: number
    traits: Record<string, number>
  }
): ConsolidatedPrediction {
  // Consolidate personality
  const personality = consolidatePersonality(kundaliPredictions, numerology, aura, palmistry)

  // Consolidate career
  const career = consolidateCareer(kundaliPredictions, numerology)

  // Consolidate love
  const love = consolidateLove(kundaliPredictions, numerology)

  // Consolidate wealth
  const wealth = consolidateWealth(kundaliPredictions, numerology)

  // Consolidate health
  const health = consolidateHealth(kundaliPredictions, aura, palmistry)

  // Consolidate spiritual
  const spiritual = consolidateSpiritual(kundaliPredictions, aura)

  // Calculate confidence score
  const confidence = calculateConfidence(kundaliPredictions, numerology, aura, palmistry)

  return {
    personality,
    career,
    love,
    wealth,
    health,
    spiritual,
    confidence,
  }
}

/**
 * Consolidate personality predictions
 */
function consolidatePersonality(
  kundali: PredictionReport,
  numerology?: any,
  aura?: any,
  palmistry?: any
): {
  kundali: string
  numerology: string
  aura?: string
  palmistry?: string
  merged: string
} {
  const kundaliPersonality = kundali.personality.overview
  const numerologyPersonality = numerology
    ? `Life Path ${numerology.lifePathNumber} and Expression ${numerology.expressionNumber} indicate ${getNumerologyPersonality(numerology)}`
    : ''

  const auraPersonality = aura
    ? `Aura color ${aura.primaryColor} suggests ${getAuraPersonality(aura.primaryColor)}`
    : undefined

  const palmistryPersonality = palmistry
    ? `Palmistry analysis indicates ${getPalmistryPersonality(palmistry)}`
    : undefined

  const merged = mergePersonalityInsights(kundaliPersonality, numerologyPersonality, auraPersonality, palmistryPersonality)

  return {
    kundali: kundaliPersonality,
    numerology: numerologyPersonality,
    aura: auraPersonality,
    palmistry: palmistryPersonality,
    merged,
  }
}

/**
 * Consolidate career predictions
 */
function consolidateCareer(
  kundali: PredictionReport,
  numerology?: any
): {
  kundali: string
  numerology: string
  merged: string
  recommendations: string[]
} {
  const kundaliCareer = kundali.career.insights
  const numerologyCareer = numerology
    ? `Numerology suggests career paths aligned with numbers ${numerology.lifePathNumber} and ${numerology.destinyNumber}`
    : ''

  const merged = `${kundaliCareer} ${numerologyCareer ? `Additionally, ${numerologyCareer.toLowerCase()}.` : ''}`

  const recommendations = [
    ...kundali.career.recommendations,
    ...(numerology ? getNumerologyCareerRecommendations(numerology) : []),
  ]

  return {
    kundali: kundaliCareer,
    numerology: numerologyCareer,
    merged,
    recommendations,
  }
}

/**
 * Consolidate love predictions
 */
function consolidateLove(
  kundali: PredictionReport,
  numerology?: any
): {
  kundali: string
  numerology: string
  merged: string
  recommendations: string[]
} {
  const kundaliLove = kundali.love.insights
  const numerologyLove = numerology
    ? `Numerology indicates relationship patterns based on Life Path ${numerology.lifePathNumber}`
    : ''

  const merged = `${kundaliLove} ${numerologyLove ? `${numerologyLove}.` : ''}`

  const recommendations = [
    ...kundali.love.recommendations,
    ...(numerology ? getNumerologyLoveRecommendations(numerology) : []),
  ]

  return {
    kundali: kundaliLove,
    numerology: numerologyLove,
    merged,
    recommendations,
  }
}

/**
 * Consolidate wealth predictions
 */
function consolidateWealth(
  kundali: PredictionReport,
  numerology?: any
): {
  kundali: string
  numerology: string
  merged: string
  recommendations: string[]
} {
  const kundaliWealth = kundali.wealth.insights
  const numerologyWealth = numerology
    ? `Numerology suggests financial patterns based on Destiny Number ${numerology.destinyNumber}`
    : ''

  const merged = `${kundaliWealth} ${numerologyWealth ? `${numerologyWealth}.` : ''}`

  const recommendations = [
    ...kundali.wealth.recommendations,
    ...(numerology ? getNumerologyWealthRecommendations(numerology) : []),
  ]

  return {
    kundali: kundaliWealth,
    numerology: numerologyWealth,
    merged,
    recommendations,
  }
}

/**
 * Consolidate health predictions
 */
function consolidateHealth(
  kundali: PredictionReport,
  aura?: any,
  palmistry?: any
): {
  kundali: string
  aura?: string
  palmistry?: string
  merged: string
  recommendations: string[]
} {
  const kundaliHealth = kundali.health.insights
  const auraHealth = aura
    ? `Aura energy score of ${aura.energyScore} indicates ${getAuraHealth(aura.energyScore)}`
    : undefined

  const palmistryHealth = palmistry
    ? `Palmistry health indicators show ${getPalmistryHealth(palmistry)}`
    : undefined

  const merged = mergeHealthInsights(kundaliHealth, auraHealth, palmistryHealth)

  const recommendations = [
    ...kundali.health.recommendations,
    ...(aura ? getAuraHealthRecommendations(aura) : []),
  ]

  return {
    kundali: kundaliHealth,
    aura: auraHealth,
    palmistry: palmistryHealth,
    merged,
    recommendations,
  }
}

/**
 * Consolidate spiritual predictions
 */
function consolidateSpiritual(
  kundali: PredictionReport,
  aura?: any
): {
  kundali: string
  aura?: string
  merged: string
  recommendations: string[]
} {
  const kundaliSpiritual = kundali.health.emotional // Using emotional as spiritual
  const auraSpiritual = aura
    ? `Aura color ${aura.primaryColor} and chakra balance indicate ${getAuraSpiritual(aura)}`
    : undefined

  const merged = `${kundaliSpiritual} ${auraSpiritual ? `${auraSpiritual}.` : ''}`

  const recommendations = [
    'Practice daily meditation',
    'Engage in spiritual practices',
    ...(aura ? getAuraSpiritualRecommendations(aura) : []),
  ]

  return {
    kundali: kundaliSpiritual,
    aura: auraSpiritual,
    merged,
    recommendations,
  }
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  kundali: PredictionReport,
  numerology?: any,
  aura?: any,
  palmistry?: any
): {
  score: number
  sources: string[]
} {
  const sources: string[] = ['kundali']
  let score = 70 // Base score from kundali

  if (numerology) {
    sources.push('numerology')
    score += 10
  }

  if (aura) {
    sources.push('aura')
    score += 10
  }

  if (palmistry) {
    sources.push('palmistry')
    score += 10
  }

  return {
    score: Math.min(score, 100),
    sources,
  }
}

// Helper functions
function getNumerologyPersonality(numerology: any): string {
  return 'balanced and harmonious personality traits'
}

function getAuraPersonality(color: string): string {
  return 'spiritual and intuitive nature'
}

function getPalmistryPersonality(palmistry: any): string {
  return 'practical and grounded personality'
}

function mergePersonalityInsights(
  kundali: string,
  numerology: string,
  aura?: string,
  palmistry?: string
): string {
  const parts = [kundali]
  if (numerology) parts.push(numerology)
  if (aura) parts.push(aura)
  if (palmistry) parts.push(palmistry)

  return parts.join(' Additionally, ')
}

function getNumerologyCareerRecommendations(numerology: any): string[] {
  return ['Align career with your life path number', 'Consider fields matching your destiny number']
}

function getNumerologyLoveRecommendations(numerology: any): string[] {
  return ['Seek partners with compatible numbers', 'Focus on emotional compatibility']
}

function getNumerologyWealthRecommendations(numerology: any): string[] {
  return ['Plan finances according to your destiny number', 'Consider lucky numbers for investments']
}

function getAuraHealth(energyScore: number): string {
  if (energyScore >= 80) return 'excellent energy levels'
  if (energyScore >= 60) return 'good energy levels'
  return 'energy levels need attention'
}

function getPalmistryHealth(palmistry: any): string {
  return 'moderate health indicators'
}

function mergeHealthInsights(kundali: string, aura?: string, palmistry?: string): string {
  const parts = [kundali]
  if (aura) parts.push(aura)
  if (palmistry) parts.push(palmistry)

  return parts.join(' ')
}

function getAuraHealthRecommendations(aura: any): string[] {
  return ['Practice energy healing', 'Maintain chakra balance']
}

function getAuraSpiritual(aura: any): string {
  return 'strong spiritual connection'
}

function getAuraSpiritualRecommendations(aura: any): string[] {
  return ['Practice chakra meditation', 'Work on spiritual growth']
}

