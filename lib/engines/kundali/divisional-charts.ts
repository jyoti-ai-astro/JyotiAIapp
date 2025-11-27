/**
 * Divisional Chart Generator
 * Part B - Section 4: Step 5
 * 
 * Currently implements D1 (Rashi Chart) only
 * Infrastructure for D9 (Navamsa) and D10 (Dashamsa) is prepared
 */

import type { GrahasCollection } from './grahas'
import type { BhavasCollection } from './bhavas'
import type { LagnaData } from './lagna'

export interface DivisionalChart {
  chartType: 'D1' | 'D9' | 'D10'
  grahas: GrahasCollection
  bhavas: BhavasCollection
  lagna: LagnaData
  aspects: Aspect[]
}

export interface Aspect {
  fromPlanet: string
  toPlanet: string
  angle: number
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
}

/**
 * Calculate aspects between planets
 * Simple aspect calculation (conjunction, opposition, trine, square, sextile)
 */
function calculateAspects(grahas: GrahasCollection): Aspect[] {
  const aspects: Aspect[] = []
  const planets = Object.keys(grahas) as Array<keyof GrahasCollection>
  
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i]
      const planet2 = planets[j]
      const long1 = grahas[planet1].longitude
      const long2 = grahas[planet2].longitude
      
      // Calculate angle between planets
      let angle = Math.abs(long1 - long2)
      if (angle > 180) {
        angle = 360 - angle
      }
      
      // Determine aspect type
      let aspectType: Aspect['type'] | null = null
      
      if (angle < 8) {
        aspectType = 'conjunction'
      } else if (Math.abs(angle - 180) < 8) {
        aspectType = 'opposition'
      } else if (Math.abs(angle - 120) < 8) {
        aspectType = 'trine'
      } else if (Math.abs(angle - 90) < 8) {
        aspectType = 'square'
      } else if (Math.abs(angle - 60) < 8) {
        aspectType = 'sextile'
      }
      
      if (aspectType) {
        aspects.push({
          fromPlanet: planet1,
          toPlanet: planet2,
          angle,
          type: aspectType,
        })
      }
    }
  }
  
  return aspects
}

/**
 * Generate D1 (Rashi Chart) - Main birth chart
 */
export function generateD1Chart(
  grahas: GrahasCollection,
  bhavas: BhavasCollection,
  lagna: LagnaData
): DivisionalChart {
  const aspects = calculateAspects(grahas)
  
  return {
    chartType: 'D1',
    grahas,
    bhavas,
    lagna,
    aspects,
  }
}

/**
 * Generate D9 (Navamsa Chart) - 9th Division
 * Infrastructure ready, implementation pending
 */
export function generateD9Chart(
  grahas: GrahasCollection,
  bhavas: BhavasCollection,
  lagna: LagnaData
): DivisionalChart {
  // TODO: Implement Navamsa calculation
  // Navamsa divides each sign into 9 parts (3.33 degrees each)
  // Each part represents a sign
  
  return {
    chartType: 'D9',
    grahas, // Will be recalculated for D9
    bhavas, // Will be recalculated for D9
    lagna, // Navamsa Lagna
    aspects: [],
  }
}

/**
 * Generate D10 (Dashamsa Chart) - 10th Division
 * Infrastructure ready, implementation pending
 */
export function generateD10Chart(
  grahas: GrahasCollection,
  bhavas: BhavasCollection,
  lagna: LagnaData
): DivisionalChart {
  // TODO: Implement Dashamsa calculation
  // Dashamsa divides each sign into 10 parts (3 degrees each)
  
  return {
    chartType: 'D10',
    grahas, // Will be recalculated for D10
    bhavas, // Will be recalculated for D10
    lagna, // Dashamsa Lagna
    aspects: [],
  }
}

