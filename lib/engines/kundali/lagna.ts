/**
 * Lagna (Ascendant) Calculation Module
 * Part B - Section 4: Step 4
 * 
 * Calculates ascendant with full details including sign and nakshatra
 */

import { calculateLagna, longitudeToRashi, longitudeToNakshatra, type BirthDetails } from './swisseph-wrapper'

export interface LagnaData {
  longitude: number
  sign: string
  nakshatra: string
  pada: number
  degreesInSign: number
  degreesInNakshatra: number
}

/**
 * Calculate complete Lagna data
 */
export async function calculateLagnaData(birth: BirthDetails): Promise<LagnaData> {
  const { toJulianDay } = await import('./swisseph-wrapper')
  const jd = toJulianDay(birth)
  
  const lagnaLongitude = await calculateLagna(jd, birth.lat, birth.lng)
  const sign = longitudeToRashi(lagnaLongitude)
  const { nakshatra, pada } = longitudeToNakshatra(lagnaLongitude)
  
  return {
    longitude: lagnaLongitude,
    sign,
    nakshatra,
    pada,
    degreesInSign: lagnaLongitude % 30,
    degreesInNakshatra: lagnaLongitude % (360 / 27),
  }
}

