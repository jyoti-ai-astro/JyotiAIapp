/**
 * Graha (Planet) Positioning Module
 * Part B - Section 4: Step 2
 * 
 * Computes detailed planet positions with all required attributes
 */

import { calculatePlanetPositions, type BirthDetails, type CalculatedPositions } from './swisseph-wrapper'

export interface GrahaData {
  planet: string
  longitude: number
  latitude: number
  distance: number
  speed: number
  retrograde: boolean
  sign: string
  nakshatra: string
  pada: number
  degreesInSign: number
  degreesInNakshatra: number
  house: number // Will be calculated in Bhava module
}

export interface GrahasCollection {
  sun: GrahaData
  moon: GrahaData
  mars: GrahaData
  mercury: GrahaData
  jupiter: GrahaData
  venus: GrahaData
  saturn: GrahaData
  rahu: GrahaData
  ketu: GrahaData
}

/**
 * Calculate all Grahas (planets) with complete details
 */
export async function calculateGrahas(birth: BirthDetails): Promise<GrahasCollection> {
  const positions = await calculatePlanetPositions(birth)
  
  return {
    sun: {
      planet: 'Sun',
      longitude: positions.sun.longitude,
      latitude: positions.sun.latitude,
      distance: positions.sun.distance,
      speed: positions.sun.speed,
      retrograde: positions.sun.retrograde,
      sign: positions.sun.sign,
      nakshatra: positions.sun.nakshatra,
      pada: positions.sun.pada,
      degreesInSign: positions.sun.degreesInSign,
      degreesInNakshatra: positions.sun.degreesInNakshatra,
      house: 0, // Will be set by Bhava calculation
    },
    moon: {
      planet: 'Moon',
      longitude: positions.moon.longitude,
      latitude: positions.moon.latitude,
      distance: positions.moon.distance,
      speed: positions.moon.speed,
      retrograde: positions.moon.retrograde,
      sign: positions.moon.sign,
      nakshatra: positions.moon.nakshatra,
      pada: positions.moon.pada,
      degreesInSign: positions.moon.degreesInSign,
      degreesInNakshatra: positions.moon.degreesInNakshatra,
      house: 0,
    },
    mars: {
      planet: 'Mars',
      longitude: positions.mars.longitude,
      latitude: positions.mars.latitude,
      distance: positions.mars.distance,
      speed: positions.mars.speed,
      retrograde: positions.mars.retrograde,
      sign: positions.mars.sign,
      nakshatra: positions.mars.nakshatra,
      pada: positions.mars.pada,
      degreesInSign: positions.mars.degreesInSign,
      degreesInNakshatra: positions.mars.degreesInNakshatra,
      house: 0,
    },
    mercury: {
      planet: 'Mercury',
      longitude: positions.mercury.longitude,
      latitude: positions.mercury.latitude,
      distance: positions.mercury.distance,
      speed: positions.mercury.speed,
      retrograde: positions.mercury.retrograde,
      sign: positions.mercury.sign,
      nakshatra: positions.mercury.nakshatra,
      pada: positions.mercury.pada,
      degreesInSign: positions.mercury.degreesInSign,
      degreesInNakshatra: positions.mercury.degreesInNakshatra,
      house: 0,
    },
    jupiter: {
      planet: 'Jupiter',
      longitude: positions.jupiter.longitude,
      latitude: positions.jupiter.latitude,
      distance: positions.jupiter.distance,
      speed: positions.jupiter.speed,
      retrograde: positions.jupiter.retrograde,
      sign: positions.jupiter.sign,
      nakshatra: positions.jupiter.nakshatra,
      pada: positions.jupiter.pada,
      degreesInSign: positions.jupiter.degreesInSign,
      degreesInNakshatra: positions.jupiter.degreesInNakshatra,
      house: 0,
    },
    venus: {
      planet: 'Venus',
      longitude: positions.venus.longitude,
      latitude: positions.venus.latitude,
      distance: positions.venus.distance,
      speed: positions.venus.speed,
      retrograde: positions.venus.retrograde,
      sign: positions.venus.sign,
      nakshatra: positions.venus.nakshatra,
      pada: positions.venus.pada,
      degreesInSign: positions.venus.degreesInSign,
      degreesInNakshatra: positions.venus.degreesInNakshatra,
      house: 0,
    },
    saturn: {
      planet: 'Saturn',
      longitude: positions.saturn.longitude,
      latitude: positions.saturn.latitude,
      distance: positions.saturn.distance,
      speed: positions.saturn.speed,
      retrograde: positions.saturn.retrograde,
      sign: positions.saturn.sign,
      nakshatra: positions.saturn.nakshatra,
      pada: positions.saturn.pada,
      degreesInSign: positions.saturn.degreesInSign,
      degreesInNakshatra: positions.saturn.degreesInNakshatra,
      house: 0,
    },
    rahu: {
      planet: 'Rahu',
      longitude: positions.rahu.longitude,
      latitude: positions.rahu.latitude,
      distance: positions.rahu.distance,
      speed: positions.rahu.speed,
      retrograde: positions.rahu.retrograde,
      sign: positions.rahu.sign,
      nakshatra: positions.rahu.nakshatra,
      pada: positions.rahu.pada,
      degreesInSign: positions.rahu.degreesInSign,
      degreesInNakshatra: positions.rahu.degreesInNakshatra,
      house: 0,
    },
    ketu: {
      planet: 'Ketu',
      longitude: positions.ketu.longitude,
      latitude: positions.ketu.latitude,
      distance: positions.ketu.distance,
      speed: positions.ketu.speed,
      retrograde: positions.ketu.retrograde,
      sign: positions.ketu.sign,
      nakshatra: positions.ketu.nakshatra,
      pada: positions.ketu.pada,
      degreesInSign: positions.ketu.degreesInSign,
      degreesInNakshatra: positions.ketu.degreesInNakshatra,
      house: 0,
    },
  }
}

