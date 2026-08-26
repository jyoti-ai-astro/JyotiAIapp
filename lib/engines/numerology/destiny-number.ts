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

function reduceNumber(num: number): number {
  if ([11, 22, 33].includes(num)) return num
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
    if ([11, 22, 33].includes(num)) return num
  }
  return num
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
  const compatibilityMap: Record<number, { bestNumbers: number[]; challengingNumbers: number[] }> = {
    1: { bestNumbers: [1, 5, 7], challengingNumbers: [2, 4, 8] },
    2: { bestNumbers: [2, 4, 8], challengingNumbers: [1, 5, 7] },
    3: { bestNumbers: [3, 6, 9], challengingNumbers: [4, 7] },
    4: { bestNumbers: [2, 4, 8], challengingNumbers: [1, 3, 5] },
    5: { bestNumbers: [1, 5, 7], challengingNumbers: [2, 4, 8] },
    6: { bestNumbers: [3, 6, 9], challengingNumbers: [1, 5] },
    7: { bestNumbers: [1, 5, 7], challengingNumbers: [2, 4, 8] },
    8: { bestNumbers: [2, 4, 8], challengingNumbers: [1, 3, 5] },
    9: { bestNumbers: [3, 6, 9], challengingNumbers: [1, 5, 7] },
    11: { bestNumbers: [2, 4, 8, 11], challengingNumbers: [1, 5, 7] },
    22: { bestNumbers: [2, 4, 8, 22], challengingNumbers: [1, 3, 5] },
    33: { bestNumbers: [3, 6, 9, 33], challengingNumbers: [1, 5, 7] },
  }
  
  return compatibilityMap[destinyNumber] || {
    bestNumbers: [],
    challengingNumbers: [],
  }
}
