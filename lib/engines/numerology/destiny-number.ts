/**
 * Destiny Number Calculator
 * Part B - Section 4: Numerology Engine
 * 
 * Calculates destiny number from name and birth date combination
 */

import { calculateNameNumerology } from './name-numerology'
import { calculateLifePathNumber } from './life-path-number'

export interface DestinyProfile {
  destinyNumber: number
  lifePathNumber: number
  expressionNumber: number
  soulUrgeNumber: number
  personalityNumber: number
  compatibility: {
    bestNumbers: number[]
    challengingNumbers: number[]
  }
}

/**
 * Calculate complete destiny profile
 */
export function calculateDestinyProfile(
  fullName: string,
  birthDate: string
): DestinyProfile {
  const nameNumerology = calculateNameNumerology(fullName)
  const lifePathNumber = calculateLifePathNumber(birthDate)
  
  // Destiny number is combination of Expression and Life Path
  const combined = nameNumerology.expressionNumber + lifePathNumber
  const destinyNumber = reduceNumber(combined)
  
  // Compatibility based on destiny number
  const compatibility = getCompatibilityNumbers(destinyNumber)
  
  return {
    destinyNumber,
    lifePathNumber,
    expressionNumber: nameNumerology.expressionNumber,
    soulUrgeNumber: nameNumerology.soulUrgeNumber,
    personalityNumber: nameNumerology.personalityNumber,
    compatibility,
  }
}

/**
 * Get compatible and challenging numbers for a given destiny number
 */
function getCompatibilityNumbers(destinyNumber: number): {
  bestNumbers: number[]
  challengingNumbers: number[]
} {
  // Simplified compatibility rules
  const compatibilityMap: Record<number, { best: number[]; challenging: number[] }> = {
    1: { best: [1, 5, 7], challenging: [2, 4, 8] },
    2: { best: [2, 4, 8], challenging: [1, 5, 7] },
    3: { best: [3, 6, 9], challenging: [4, 7] },
    4: { best: [2, 4, 8], challenging: [1, 3, 5] },
    5: { best: [1, 5, 7], challenging: [2, 4, 8] },
    6: { best: [3, 6, 9], challenging: [1, 5] },
    7: { best: [1, 5, 7], challenging: [2, 4, 8] },
    8: { best: [2, 4, 8], challenging: [1, 3, 5] },
    9: { best: [3, 6, 9], challenging: [1, 5, 7] },
    11: { best: [2, 4, 8, 11], challenging: [1, 5, 7] },
    22: { best: [2, 4, 8, 22], challenging: [1, 3, 5] },
    33: { best: [3, 6, 9, 33], challenging: [1, 5, 7] },
  }
  
  return compatibilityMap[destinyNumber] || {
    best: [],
    challenging: [],
  }
}
