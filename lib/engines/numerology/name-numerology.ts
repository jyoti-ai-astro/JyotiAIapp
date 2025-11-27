/**
 * Name Numerology Calculator
 * Part B - Section 4: Numerology Engine
 * 
 * Calculates numerology based on full name using Pythagorean system
 */

export interface NameNumerology {
  fullName: string
  expressionNumber: number // Sum of all letters
  soulUrgeNumber: number // Sum of vowels only
  personalityNumber: number // Sum of consonants only
  destinyNumber: number // Combined expression
}

/**
 * Letter to number mapping (Pythagorean system)
 */
const LETTER_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
}

/**
 * Vowels in English
 */
const VOWELS = ['a', 'e', 'i', 'o', 'u']

/**
 * Reduce number to single digit (master numbers 11, 22, 33 are exceptions)
 */
function reduceNumber(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num
  while (num > 9) {
    num = num
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0)
  }
  return num
}

/**
 * Convert name to numbers array
 */
function nameToNumbers(name: string): number[] {
  return name
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .split('')
    .map((char) => LETTER_MAP[char] || 0)
    .filter((num) => num > 0)
}

/**
 * Calculate Expression Number (sum of all letters)
 */
export function calculateExpressionNumber(fullName: string): number {
  const numbers = nameToNumbers(fullName)
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  return reduceNumber(sum)
}

/**
 * Calculate Soul Urge Number (sum of vowels only)
 */
export function calculateSoulUrgeNumber(fullName: string): number {
  const nameLower = fullName.toLowerCase().replace(/[^a-z]/g, '')
  const vowelNumbers: number[] = []
  
  for (const char of nameLower) {
    if (VOWELS.includes(char)) {
      vowelNumbers.push(LETTER_MAP[char] || 0)
    }
  }
  
  const sum = vowelNumbers.reduce((acc, num) => acc + num, 0)
  return reduceNumber(sum)
}

/**
 * Calculate Personality Number (sum of consonants only)
 */
export function calculatePersonalityNumber(fullName: string): number {
  const nameLower = fullName.toLowerCase().replace(/[^a-z]/g, '')
  const consonantNumbers: number[] = []
  
  for (const char of nameLower) {
    if (!VOWELS.includes(char)) {
      consonantNumbers.push(LETTER_MAP[char] || 0)
    }
  }
  
  const sum = consonantNumbers.reduce((acc, num) => acc + num, 0)
  return reduceNumber(sum)
}

/**
 * Calculate complete name numerology
 */
export function calculateNameNumerology(fullName: string): NameNumerology {
  const expressionNumber = calculateExpressionNumber(fullName)
  const soulUrgeNumber = calculateSoulUrgeNumber(fullName)
  const personalityNumber = calculatePersonalityNumber(fullName)
  
  // Destiny Number is combination of Expression and Soul Urge
  const destinyNumber = reduceNumber(expressionNumber + soulUrgeNumber)
  
  return {
    fullName,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    destinyNumber,
  }
}
