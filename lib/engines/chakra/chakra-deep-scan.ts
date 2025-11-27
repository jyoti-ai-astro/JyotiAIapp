/**
 * Chakra + Aura Deep Scan
 * Part B - Section 3: Aura Reading Engine
 * Milestone 8 - Step 8
 * 
 * Deep analysis of chakra balance and aura colors
 */

export interface ChakraDeepScan {
  chakras: Array<{
    name: string
    location: string
    element: string
    balance: number
    status: 'balanced' | 'overactive' | 'underactive' | 'blocked'
    color: string
    issues: string[]
    recommendations: string[]
  }>
  aura: {
    primaryColor: string
    secondaryColors: string[]
    energyLevel: number
    interpretation: string
    recommendations: string[]
  }
  overall: {
    energyScore: number
    balanceScore: number
    healthScore: number
    spiritualScore: number
  }
  remedies: Array<{
    chakra: string
    remedy: string
    practice: string
    duration: string
  }>
}

/**
 * Perform deep chakra and aura scan
 */
export function performDeepScan(
  auraData?: {
    primaryColor: string
    energyScore: number
    chakraBalance: Record<string, number>
  },
  kundali?: {
    grahas: Record<string, any>
  }
): ChakraDeepScan {
  // Get chakra data from aura or use defaults
  const chakraBalance = auraData?.chakraBalance || getDefaultChakraBalance()

  // Analyze each chakra
  const chakras = analyzeChakras(chakraBalance, kundali)

  // Analyze aura
  const aura = analyzeAura(auraData, kundali)

  // Calculate overall scores
  const overall = calculateOverallScores(chakras, aura)

  // Generate remedies
  const remedies = generateChakraRemedies(chakras)

  return {
    chakras,
    aura,
    overall,
    remedies,
  }
}

/**
 * Get default chakra balance
 */
function getDefaultChakraBalance(): Record<string, number> {
  return {
    root: 70,
    sacral: 65,
    solar: 75,
    heart: 70,
    throat: 68,
    thirdEye: 72,
    crown: 75,
  }
}

/**
 * Analyze individual chakras
 */
function analyzeChakras(
  chakraBalance: Record<string, number>,
  kundali?: any
): Array<{
  name: string
  location: string
  element: string
  balance: number
  status: 'balanced' | 'overactive' | 'underactive' | 'blocked'
  color: string
  issues: string[]
  recommendations: string[]
}> {
  const chakraInfo: Record<string, { name: string; location: string; element: string; color: string }> = {
    root: { name: 'Root Chakra', location: 'Base of spine', element: 'Earth', color: 'Red' },
    sacral: { name: 'Sacral Chakra', location: 'Lower abdomen', element: 'Water', color: 'Orange' },
    solar: { name: 'Solar Plexus Chakra', location: 'Upper abdomen', element: 'Fire', color: 'Yellow' },
    heart: { name: 'Heart Chakra', location: 'Chest', element: 'Air', color: 'Green' },
    throat: { name: 'Throat Chakra', location: 'Throat', element: 'Ether', color: 'Blue' },
    thirdEye: { name: 'Third Eye Chakra', location: 'Forehead', element: 'Light', color: 'Indigo' },
    crown: { name: 'Crown Chakra', location: 'Top of head', element: 'Thought', color: 'Violet' },
  }

  return Object.entries(chakraBalance).map(([key, balance]) => {
    const info = chakraInfo[key]
    const status = getChakraStatus(balance)
    const issues = getChakraIssues(key, balance, status)
    const recommendations = getChakraRecommendations(key, balance, status)

    return {
      name: info.name,
      location: info.location,
      element: info.element,
      balance,
      status,
      color: info.color,
      issues,
      recommendations,
    }
  })
}

/**
 * Get chakra status
 */
function getChakraStatus(balance: number): 'balanced' | 'overactive' | 'underactive' | 'blocked' {
  if (balance >= 80) return 'overactive'
  if (balance >= 60) return 'balanced'
  if (balance >= 40) return 'underactive'
  return 'blocked'
}

/**
 * Get chakra issues
 */
function getChakraIssues(
  chakra: string,
  balance: number,
  status: string
): string[] {
  const issues: string[] = []

  if (status === 'overactive') {
    issues.push('Chakra may be overactive, causing imbalance')
  } else if (status === 'underactive') {
    issues.push('Chakra needs activation and balancing')
  } else if (status === 'blocked') {
    issues.push('Chakra appears blocked and requires attention')
  }

  // Chakra-specific issues
  const chakraIssues: Record<string, string[]> = {
    root: ['Security concerns', 'Grounding issues'],
    sacral: ['Creativity blocks', 'Emotional expression'],
    solar: ['Self-confidence', 'Personal power'],
    heart: ['Love and compassion', 'Emotional healing'],
    throat: ['Communication', 'Self-expression'],
    thirdEye: ['Intuition', 'Inner vision'],
    crown: ['Spiritual connection', 'Higher consciousness'],
  }

  if (chakraIssues[chakra]) {
    issues.push(...chakraIssues[chakra])
  }

  return issues
}

/**
 * Get chakra recommendations
 */
function getChakraRecommendations(
  chakra: string,
  balance: number,
  status: string
): string[] {
  const recommendations: string[] = []

  if (status === 'overactive') {
    recommendations.push('Practice grounding exercises')
    recommendations.push('Use calming meditation')
  } else if (status === 'underactive' || status === 'blocked') {
    recommendations.push('Practice chakra-specific meditation')
    recommendations.push('Use corresponding gemstones')
    recommendations.push('Chant chakra-specific mantras')
  }

  // Chakra-specific recommendations
  const chakraRecommendations: Record<string, string[]> = {
    root: ['Grounding exercises', 'Red gemstones', 'Muladhara mantra'],
    sacral: ['Creative activities', 'Orange gemstones', 'Svadhisthana mantra'],
    solar: ['Confidence building', 'Yellow gemstones', 'Manipura mantra'],
    heart: ['Loving-kindness meditation', 'Green gemstones', 'Anahata mantra'],
    throat: ['Singing or chanting', 'Blue gemstones', 'Vishuddha mantra'],
    thirdEye: ['Meditation', 'Indigo gemstones', 'Ajna mantra'],
    crown: ['Spiritual practices', 'Violet gemstones', 'Sahasrara mantra'],
  }

  if (chakraRecommendations[chakra]) {
    recommendations.push(...chakraRecommendations[chakra])
  }

  return recommendations
}

/**
 * Analyze aura
 */
function analyzeAura(
  auraData?: any,
  kundali?: any
): {
  primaryColor: string
  secondaryColors: string[]
  energyLevel: number
  interpretation: string
  recommendations: string[]
} {
  const primaryColor = auraData?.primaryColor || 'indigo'
  const energyLevel = auraData?.energyScore || 75

  // Color interpretations
  const colorInterpretations: Record<string, string> = {
    red: 'Strong physical energy and passion',
    orange: 'Creative and expressive energy',
    yellow: 'Intellectual and confident energy',
    green: 'Healing and compassionate energy',
    blue: 'Calm and communicative energy',
    indigo: 'Intuitive and spiritual energy',
    violet: 'Highly spiritual and enlightened energy',
  }

  const interpretation = colorInterpretations[primaryColor] || 'Balanced spiritual energy'

  const recommendations: string[] = []
  if (energyLevel < 70) {
    recommendations.push('Practice energy healing techniques')
    recommendations.push('Spend time in nature')
    recommendations.push('Meditation and pranayama')
  }

  return {
    primaryColor,
    secondaryColors: auraData?.auraColors || [primaryColor],
    energyLevel,
    interpretation,
    recommendations,
  }
}

/**
 * Calculate overall scores
 */
function calculateOverallScores(
  chakras: any[],
  aura: any
): {
  energyScore: number
  balanceScore: number
  healthScore: number
  spiritualScore: number
} {
  const avgChakraBalance = chakras.reduce((sum, ch) => sum + ch.balance, 0) / chakras.length

  return {
    energyScore: aura.energyLevel,
    balanceScore: Math.round(avgChakraBalance),
    healthScore: Math.round((chakras[0].balance + chakras[2].balance) / 2), // Root + Solar
    spiritualScore: Math.round((chakras[5].balance + chakras[6].balance) / 2), // Third Eye + Crown
  }
}

/**
 * Generate chakra remedies
 */
function generateChakraRemedies(chakras: any[]): Array<{
  chakra: string
  remedy: string
  practice: string
  duration: string
}> {
  const remedies: Array<{ chakra: string; remedy: string; practice: string; duration: string }> = []

  chakras.forEach((chakra) => {
    if (chakra.status !== 'balanced') {
      remedies.push({
        chakra: chakra.name,
        remedy: `Balance ${chakra.name}`,
        practice: chakra.recommendations[0] || 'Meditation',
        duration: '21 days',
      })
    }
  })

  return remedies
}

