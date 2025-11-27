/**
 * Mobile Number Analysis
 * Part B - Section 4: Numerology Engine
 * 
 * Analyzes mobile/phone numbers for compatibility and luck
 */

export interface MobileNumberAnalysis {
  number: string
  sum: number
  singleDigit: number
  isLucky: boolean
  compatibility: string
  recommendations: string[]
}

/**
 * Analyze mobile number
 */
export function analyzeMobileNumber(mobileNumber: string): MobileNumberAnalysis {
  // Remove all non-digits
  const digits = mobileNumber.replace(/\D/g, '')
  
  if (digits.length === 0) {
    throw new Error('Invalid mobile number')
  }
  
  // Calculate sum of all digits
  const sum = digits
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0)
  
  // Reduce to single digit
  const singleDigit = reduceNumber(sum)
  
  // Determine if lucky (based on single digit and patterns)
  const isLucky = isLuckyNumber(singleDigit, digits)
  
  // Get compatibility
  const compatibility = getMobileCompatibility(singleDigit)
  
  // Get recommendations
  const recommendations = getMobileRecommendations(singleDigit, digits)
  
  return {
    number: mobileNumber,
    sum,
    singleDigit,
    isLucky,
    compatibility,
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
 * Check if number is considered lucky
 */
function isLuckyNumber(singleDigit: number, digits: string): boolean {
  // Lucky numbers: 1, 3, 5, 6, 7, 8, 9
  const luckyDigits = [1, 3, 5, 6, 7, 8, 9]
  
  // Check single digit
  if (!luckyDigits.includes(singleDigit)) {
    return false
  }
  
  // Check for repeating patterns (e.g., 1111, 3333)
  const hasRepeatingPattern = /(\d)\1{3,}/.test(digits)
  
  return hasRepeatingPattern || luckyDigits.includes(singleDigit)
}

/**
 * Get mobile number compatibility
 */
function getMobileCompatibility(singleDigit: number): string {
  const compatibilityMap: Record<number, string> = {
    1: 'Excellent for leadership and independence',
    2: 'Good for partnerships and cooperation',
    3: 'Great for creativity and communication',
    4: 'Stable and practical',
    5: 'Dynamic and adventurous',
    6: 'Harmonious and nurturing',
    7: 'Spiritual and analytical',
    8: 'Material success and authority',
    9: 'Humanitarian and compassionate',
  }
  
  return compatibilityMap[singleDigit] || 'Neutral energy'
}

/**
 * Get recommendations for mobile number
 */
function getMobileRecommendations(singleDigit: number, digits: string): string[] {
  const recommendations: string[] = []
  
  // General recommendations based on single digit
  if ([1, 5, 7].includes(singleDigit)) {
    recommendations.push('Good for business and career')
  }
  
  if ([2, 6, 9].includes(singleDigit)) {
    recommendations.push('Favorable for relationships')
  }
  
  if ([3, 6, 9].includes(singleDigit)) {
    recommendations.push('Supports creative endeavors')
  }
  
  // Check for specific patterns
  if (digits.includes('111')) {
    recommendations.push('Strong manifestation energy')
  }
  
  if (digits.includes('888')) {
    recommendations.push('Material abundance indicator')
  }
  
  return recommendations.length > 0 ? recommendations : ['Neutral number - no specific recommendations']
}
