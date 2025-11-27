/**
 * Vimshottari Dasha Calculator
 * Part B - Section 4: Step 6
 * 
 * Calculates Mahadasha, Antar Dasha, and Pratyantar Dasha
 * Based on Moon's Nakshatra and Pada
 */

export interface DashaPeriod {
  planet: string
  startDate: Date
  endDate: Date
  level: 'mahadasha' | 'antardasha' | 'pratyantardasha'
  parentPlanet?: string
  subPeriods?: DashaPeriod[]
}

export interface DashaCalculation {
  currentMahadasha: DashaPeriod
  currentAntardasha: DashaPeriod
  currentPratyantardasha: DashaPeriod
  allPeriods: DashaPeriod[]
}

/**
 * Vimshottari Dasha periods (in years)
 */
const DASHA_PERIODS: Record<string, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
}

/**
 * Dasha sequence (order of planets)
 */
const DASHA_SEQUENCE = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars',
  'Rahu', 'Jupiter', 'Saturn', 'Mercury',
]

/**
 * Nakshatra to starting planet mapping
 */
const NAKSHATRA_TO_DASHA: Record<string, string> = {
  'Ashwini': 'Ketu',
  'Bharani': 'Venus',
  'Krittika': 'Sun',
  'Rohini': 'Moon',
  'Mrigashira': 'Mars',
  'Ardra': 'Rahu',
  'Punarvasu': 'Jupiter',
  'Pushya': 'Saturn',
  'Ashlesha': 'Mercury',
  'Magha': 'Ketu',
  'Purva Phalguni': 'Venus',
  'Uttara Phalguni': 'Sun',
  'Hasta': 'Moon',
  'Chitra': 'Mars',
  'Swati': 'Rahu',
  'Vishakha': 'Jupiter',
  'Anuradha': 'Saturn',
  'Jyeshta': 'Mercury',
  'Mula': 'Ketu',
  'Purva Ashadha': 'Venus',
  'Uttara Ashadha': 'Sun',
  'Shravana': 'Moon',
  'Dhanishta': 'Mars',
  'Shatabhisha': 'Rahu',
  'Purva Bhadrapada': 'Jupiter',
  'Uttara Bhadrapada': 'Saturn',
  'Revati': 'Mercury',
}

/**
 * Calculate Vimshottari Dasha
 */
export function calculateVimshottariDasha(
  moonNakshatra: string,
  moonPada: number,
  birthDate: Date
): DashaCalculation {
  // Get starting planet from Moon's Nakshatra
  const startingPlanet = NAKSHATRA_TO_DASHA[moonNakshatra] || 'Ketu'
  
  // Calculate offset based on Pada
  // Each Pada is 1/4 of the Nakshatra (3.33 degrees)
  // Pada 1 = 0%, Pada 2 = 25%, Pada 3 = 50%, Pada 4 = 75%
  const padaOffset = (moonPada - 1) * 0.25
  
  // Find starting planet index
  const startingIndex = DASHA_SEQUENCE.indexOf(startingPlanet)
  
  // Calculate how much of the first dasha has elapsed
  const firstDashaYears = DASHA_PERIODS[startingPlanet]
  const elapsedYears = firstDashaYears * padaOffset
  
  // Start date of first Mahadasha
  const firstDashaStart = new Date(birthDate)
  firstDashaStart.setFullYear(firstDashaStart.getFullYear() - elapsedYears)
  
  // Generate all Mahadasha periods (120 year cycle)
  const allPeriods: DashaPeriod[] = []
  let currentDate = new Date(firstDashaStart)
  
  // Generate 2 full cycles (240 years) to ensure coverage
  for (let cycle = 0; cycle < 2; cycle++) {
    for (let i = 0; i < DASHA_SEQUENCE.length; i++) {
      const planetIndex = (startingIndex + i) % DASHA_SEQUENCE.length
      const planet = DASHA_SEQUENCE[planetIndex]
      const periodYears = DASHA_PERIODS[planet]
      
      const startDate = new Date(currentDate)
      const endDate = new Date(currentDate)
      endDate.setFullYear(endDate.getFullYear() + periodYears)
      
      // Generate Antar Dashas
      const antardashas: DashaPeriod[] = []
      let antardashaStart = new Date(startDate)
      
      for (let j = 0; j < DASHA_SEQUENCE.length; j++) {
        const antardashaPlanetIndex = (planetIndex + j) % DASHA_SEQUENCE.length
        const antardashaPlanet = DASHA_SEQUENCE[antardashaPlanetIndex]
        const antardashaYears = (DASHA_PERIODS[antardashaPlanet] * periodYears) / 120
        
        const antardashaEnd = new Date(antardashaStart)
        antardashaEnd.setFullYear(antardashaEnd.getFullYear() + antardashaYears)
        
        // Generate Pratyantar Dashas
        const pratyantardashas: DashaPeriod[] = []
        let pratyantardashaStart = new Date(antardashaStart)
        
        for (let k = 0; k < DASHA_SEQUENCE.length; k++) {
          const pratyantarPlanetIndex = (antardashaPlanetIndex + k) % DASHA_SEQUENCE.length
          const pratyantarPlanet = DASHA_SEQUENCE[pratyantarPlanetIndex]
          const pratyantarYears = (DASHA_PERIODS[pratyantarPlanet] * antardashaYears) / 120
          
          const pratyantardashaEnd = new Date(pratyantardashaStart)
          pratyantardashaEnd.setFullYear(pratyantardashaEnd.getFullYear() + pratyantarYears)
          
          pratyantardashas.push({
            planet: pratyantarPlanet,
            startDate: new Date(pratyantardashaStart),
            endDate: new Date(pratyantardashaEnd),
            level: 'pratyantardasha',
            parentPlanet: antardashaPlanet,
          })
          
          pratyantardashaStart = new Date(pratyantardashaEnd)
        }
        
        antardashas.push({
          planet: antardashaPlanet,
          startDate: new Date(antardashaStart),
          endDate: new Date(antardashaEnd),
          level: 'antardasha',
          parentPlanet: planet,
          subPeriods: pratyantardashas,
        })
        
        antardashaStart = new Date(antardashaEnd)
      }
      
      allPeriods.push({
        planet,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        level: 'mahadasha',
        subPeriods: antardashas,
      })
      
      currentDate = new Date(endDate)
    }
  }
  
  // Find current periods
  const now = new Date()
  let currentMahadasha: DashaPeriod | null = null
  let currentAntardasha: DashaPeriod | null = null
  let currentPratyantardasha: DashaPeriod | null = null
  
  for (const mahadasha of allPeriods) {
    if (now >= mahadasha.startDate && now < mahadasha.endDate) {
      currentMahadasha = mahadasha
      
      if (mahadasha.subPeriods) {
        for (const antardasha of mahadasha.subPeriods) {
          if (now >= antardasha.startDate && now < antardasha.endDate) {
            currentAntardasha = antardasha
            
            if (antardasha.subPeriods) {
              for (const pratyantardasha of antardasha.subPeriods) {
                if (now >= pratyantardasha.startDate && now < pratyantardasha.endDate) {
                  currentPratyantardasha = pratyantardasha
                  break
                }
              }
            }
            break
          }
        }
      }
      break
    }
  }
  
  // Fallback to first period if none found
  if (!currentMahadasha) {
    currentMahadasha = allPeriods[0]
    currentAntardasha = currentMahadasha.subPeriods?.[0] || null
    currentPratyantardasha = currentAntardasha?.subPeriods?.[0] || null
  }
  
  return {
    currentMahadasha: currentMahadasha!,
    currentAntardasha: currentAntardasha!,
    currentPratyantardasha: currentPratyantardasha!,
    allPeriods,
  }
}

