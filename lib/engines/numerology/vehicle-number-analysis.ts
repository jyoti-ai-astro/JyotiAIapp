/**
 * Vehicle Number Analysis
 * Part B - Section 4: Numerology Engine
 * 
 * Analyzes vehicle registration numbers for compatibility
 */

export interface VehicleNumberAnalysis {
  number: string
  sum: number
  singleDigit: number
  isLucky: boolean
  compatibility: string
  safety: string
  recommendations: string[]
}

/**
 * Analyze vehicle number
 */
export function analyzeVehicleNumber(vehicleNumber: string): VehicleNumberAnalysis {
  // Extract all digits from vehicle number
  const digits = vehicleNumber.replace(/\D/g, '')
  
  if (digits.length === 0) {
    throw new Error('Invalid vehicle number')
  }
  
  // Calculate sum
  const sum = digits
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0)
  
  const singleDigit = reduceNumber(sum)
  
  const isLucky = isLuckyVehicleNumber(singleDigit, digits)
  const compatibility = getVehicleCompatibility(singleDigit)
  const safety = getVehicleSafety(singleDigit)
  const recommendations = getVehicleRecommendations(singleDigit, digits)
  
  return {
    number: vehicleNumber,
    sum,
    singleDigit,
    isLucky,
    compatibility,
    safety,
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
 * Check if vehicle number is lucky
 */
function isLuckyVehicleNumber(singleDigit: number, digits: string): boolean {
  // Lucky numbers for vehicles: 1, 3, 5, 6, 8
  const luckyDigits = [1, 3, 5, 6, 8]
  return luckyDigits.includes(singleDigit)
}

/**
 * Get vehicle compatibility
 */
function getVehicleCompatibility(singleDigit: number): string {
  const compatibilityMap: Record<number, string> = {
    1: 'Excellent for personal vehicles, leadership energy',
    2: 'Good for family vehicles, partnership energy',
    3: 'Great for creative professionals',
    4: 'Stable and reliable',
    5: 'Dynamic and adventurous',
    6: 'Comfortable and harmonious',
    7: 'Spiritual and analytical',
    8: 'Luxury and material success',
    9: 'Humanitarian and service-oriented',
  }
  
  return compatibilityMap[singleDigit] || 'Neutral compatibility'
}

/**
 * Get vehicle safety assessment
 */
function getVehicleSafety(singleDigit: number): string {
  const safetyMap: Record<number, string> = {
    1: 'Good safety, requires careful driving',
    2: 'Stable and safe',
    3: 'Moderate safety, avoid distractions',
    4: 'Very stable and safe',
    5: 'Requires careful attention',
    6: 'Safe and comfortable',
    7: 'Analytical, good safety',
    8: 'Stable, good safety',
    9: 'Safe with proper maintenance',
  }
  
  return safetyMap[singleDigit] || 'Standard safety'
}

/**
 * Get vehicle recommendations
 */
function getVehicleRecommendations(singleDigit: number, digits: string): string[] {
  const recommendations: string[] = []
  
  if ([1, 5, 8].includes(singleDigit)) {
    recommendations.push('Good for business use')
  }
  
  if ([2, 6, 9].includes(singleDigit)) {
    recommendations.push('Ideal for family use')
  }
  
  if ([3, 6].includes(singleDigit)) {
    recommendations.push('Suitable for creative professionals')
  }
  
  if (digits.includes('4')) {
    recommendations.push('Stable and reliable number')
  }
  
  if (digits.includes('8')) {
    recommendations.push('Material success indicator')
  }
  
  return recommendations.length > 0
    ? recommendations
    : ['Standard vehicle number - no specific recommendations']
}
