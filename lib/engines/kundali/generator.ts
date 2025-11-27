/**
 * Complete Kundali Generator
 * Part B - Section 4: Full Kundali Engine
 * 
 * Orchestrates all modules to generate complete birth chart
 */

import type { BirthDetails } from './swisseph-wrapper'
import { calculateGrahas, type GrahasCollection } from './grahas'
import { calculateBhavas, type BhavasCollection } from './bhavas'
import { calculateLagnaData, type LagnaData } from './lagna'
import { generateD1Chart, type DivisionalChart } from './divisional-charts'
import { calculateVimshottariDasha, type DashaCalculation } from './dasha'

export interface KundaliData {
  meta: {
    birthDetails: BirthDetails
    generatedAt: Date
    chartType: 'D1'
    houseSystem: string
  }
  D1: DivisionalChart
  dasha: DashaCalculation
}

/**
 * Generate complete Kundali
 */
export async function generateFullKundali(birth: BirthDetails): Promise<KundaliData> {
  // Step 1: Calculate Grahas (Planets)
  const grahas = await calculateGrahas(birth)
  
  // Step 2: Calculate Lagna
  const lagna = await calculateLagnaData(birth)
  
  // Step 3: Calculate Bhavas (Houses)
  const bhavas = await calculateBhavas(birth, lagna.longitude, grahas, 'placidus')
  
  // Step 4: Generate D1 Chart
  const D1 = generateD1Chart(grahas, bhavas, lagna)
  
  // Step 5: Calculate Dasha
  const dasha = calculateVimshottariDasha(
    grahas.moon.nakshatra,
    grahas.moon.pada,
    new Date(birth.year, birth.month - 1, birth.day, birth.hour, birth.minute)
  )
  
  return {
    meta: {
      birthDetails: birth,
      generatedAt: new Date(),
      chartType: 'D1',
      houseSystem: 'placidus',
    },
    D1,
    dasha,
  }
}
