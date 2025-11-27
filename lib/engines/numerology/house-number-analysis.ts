/**
 * House Number Analysis
 * Part B - Section 4: Numerology Engine
 * 
 * Analyzes house/flat numbers for Vastu and numerology compatibility
 */

export interface HouseNumberAnalysis {
  number: string
  sum: number
  singleDigit: number
  isLucky: boolean
  vastuCompatibility: string
  energy: string
  recommendations: string[]
}

/**
 * Analyze house number
 */
export function analyzeHouseNumber(houseNumber: string): HouseNumberAnalysis {
  // Extract all digits
  const digits = houseNumber.replace(/\D/g, '')
  
  if (digits.length === 0) {
    throw new Error('Invalid house number')
  }
  
  // Calculate sum
  const sum = digits
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0)
  
  const singleDigit = reduceNumber(sum)
  
  const isLucky = isLuckyHouseNumber(singleDigit, digits)
  const vastuCompatibility = getVastuCompatibility(singleDigit)
  const energy = getHouseEnergy(singleDigit)
  const recommendations = getHouseRecommendations(singleDigit, digits)
  
  return {
    number: houseNumber,
    sum,
    singleDigit,
    isLucky,
    vastuCompatibility,
    energy,
    recommendations,
  }
}

/**
 * Reduce number to single digit
 */
function reduceNumber(num: number): number {
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0)
  }
  return num
}

/**
 * Check if house number is lucky
 */
function isLuckyHouseNumber(singleDigit: number, digits: string): boolean {
  // Lucky house numbers: 1, 2, 3, 6, 8, 9
  const luckyDigits = [1, 2, 3, 6, 8, 9]
  return luckyDigits.includes(singleDigit)
}

/**
 * Get Vastu compatibility
 */
function getVastuCompatibility(singleDigit: number): string {
  const vastuMap: Record<number, string> = {
    1: 'Good for leadership and independence',
    2: 'Excellent for family harmony',
    3: 'Great for creativity and communication',
    4: 'Stable but may need Vastu remedies',
    5: 'Dynamic energy, good for change',
    6: 'Harmonious and nurturing',
    7: 'Spiritual and peaceful',
    8: 'Material success, requires balance',
    9: 'Humanitarian and compassionate',
  }
  
  return vastuMap[singleDigit] || 'Neutral Vastu compatibility'
}

/**
 * Get house energy type
 */
function getHouseEnergy(singleDigit: number): string {
  const energyMap: Record<number, string> = {
    1: 'Active and independent',
    2: 'Peaceful and cooperative',
    3: 'Creative and expressive',
    4: 'Stable and grounded',
    5: 'Dynamic and changing',
    6: 'Harmonious and balanced',
    7: 'Spiritual and introspective',
    8: 'Material and ambitious',
    9: 'Compassionate and giving',
  }
  
  return energyMap[singleDigit] || 'Neutral energy'
}

/**
 * Get house recommendations
 */
function getHouseRecommendations(singleDigit: number, digits: string): string[] {
  const recommendations: string[] = []
  
  if ([1, 5, 8].includes(singleDigit)) {
    recommendations.push('Good for business and career growth')
  }
  
  if ([2, 6, 9].includes(singleDigit)) {
    recommendations.push('Ideal for family and relationships')
  }
  
  if ([3, 6].includes(singleDigit)) {
    recommendations.push('Favorable for creative activities')
  }
  
  if (singleDigit === 4) {
    recommendations.push('May benefit from Vastu remedies')
  }
  
  if (singleDigit === 7) {
    recommendations.push('Good for meditation and spiritual practices')
  }
  
  if (digits.includes('8')) {
    recommendations.push('Material prosperity indicator')
  }
  
  return recommendations.length > 0
    ? recommendations
    : ['Standard house number - neutral energy']
}
