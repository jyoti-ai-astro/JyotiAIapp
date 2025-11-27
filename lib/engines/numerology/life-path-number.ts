/**
 * Life Path Number Calculator
 * Part B - Section 4: Numerology Engine
 * 
 * Calculates life path number from birth date
 */

/**
 * Calculate Life Path Number from birth date
 */
export function calculateLifePathNumber(birthDate: string): number {
  const date = new Date(birthDate)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  
  const dayReduced = reduceNumber(day)
  const monthReduced = reduceNumber(month)
  const yearReduced = reduceNumber(year)
  
  const lifePath = reduceNumber(dayReduced + monthReduced + yearReduced)
  
  return lifePath
}

/**
 * Reduce number to single digit (master numbers preserved)
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
