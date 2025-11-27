/**
 * Bhava (House) Calculation Module
 * Part B - Section 4: Step 3
 * 
 * Computes house cusps and planet placements using Placidus house system
 * (Can be extended to Whole Sign system for Indian preference)
 */

import { calculateLagna, type BirthDetails } from './swisseph-wrapper'
import type { GrahasCollection } from './grahas'

export interface BhavaData {
  houseNumber: number
  cuspLongitude: number
  sign: string
  planets: string[] // Array of planet names in this house
}

export interface BhavasCollection {
  [key: number]: BhavaData
}

/**
 * House system type
 */
export type HouseSystem = 'placidus' | 'whole-sign' | 'equal'

/**
 * Calculate house cusps using Placidus system
 * This is a simplified version - full implementation requires Swiss Ephemeris house calculation
 */
export async function calculateBhavas(
  birth: BirthDetails,
  lagna: number,
  grahas: GrahasCollection,
  houseSystem: HouseSystem = 'placidus'
): Promise<BhavasCollection> {
  const bhavas: BhavasCollection = {}
  
  if (houseSystem === 'whole-sign') {
    // Whole Sign system: Each house = one sign, starting from Lagna
    const lagnaSignIndex = Math.floor(lagna / 30)
    
    for (let i = 1; i <= 12; i++) {
      const signIndex = (lagnaSignIndex + i - 1) % 12
      const cuspLongitude = signIndex * 30
      const sign = getSignName(signIndex)
      
      bhavas[i] = {
        houseNumber: i,
        cuspLongitude,
        sign,
        planets: [],
      }
    }
  } else {
    // Placidus system (simplified - full implementation needs Swiss Ephemeris)
    // For now, use whole sign as approximation
    const lagnaSignIndex = Math.floor(lagna / 30)
    
    for (let i = 1; i <= 12; i++) {
      const signIndex = (lagnaSignIndex + i - 1) % 12
      const cuspLongitude = signIndex * 30
      const sign = getSignName(signIndex)
      
      bhavas[i] = {
        houseNumber: i,
        cuspLongitude,
        sign,
        planets: [],
      }
    }
  }
  
  // Assign planets to houses
  assignPlanetsToHouses(grahas, bhavas)
  
  return bhavas
}

/**
 * Get sign name from index
 */
function getSignName(index: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ]
  return signs[index % 12]
}

/**
 * Assign planets to their respective houses
 */
function assignPlanetsToHouses(grahas: GrahasCollection, bhavas: BhavasCollection): void {
  const planetEntries = Object.entries(grahas) as [string, typeof grahas.sun][]
  
  planetEntries.forEach(([planetName, graha]) => {
    const house = findHouseForPlanet(graha.longitude, bhavas)
    if (house) {
      bhavas[house].planets.push(planetName)
      graha.house = house
    }
  })
}

/**
 * Find which house a planet belongs to based on its longitude
 */
function findHouseForPlanet(planetLongitude: number, bhavas: BhavasCollection): number | null {
  // Normalize longitude
  planetLongitude = ((planetLongitude % 360) + 360) % 360
  
  // For whole sign system, find house by sign
  for (let i = 1; i <= 12; i++) {
    const bhava = bhavas[i]
    const signStart = bhava.cuspLongitude
    const signEnd = (signStart + 30) % 360
    
    // Handle wrap-around (Pisces to Aries)
    if (signStart > signEnd) {
      if (planetLongitude >= signStart || planetLongitude < signEnd) {
        return i
      }
    } else {
      if (planetLongitude >= signStart && planetLongitude < signEnd) {
        return i
      }
    }
  }
  
  return null
}

