/**
 * Business Nature Analysis
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 3
 * 
 * Analyzes business nature compatibility (liquid, fire, tech, food, etc.)
 */

export interface BusinessNature {
  type: 'liquid' | 'fire' | 'tech' | 'food' | 'retail' | 'service' | 'manufacturing' | 'real-estate'
  element: 'water' | 'fire' | 'earth' | 'air' | 'ether'
  compatibility: number
  reasoning: string
  recommendations: string[]
  challenges: string[]
}

/**
 * Analyze business nature compatibility
 */
export function analyzeBusinessNature(
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): BusinessNature[] {
  const analyses: BusinessNature[] = []

  // Liquid/Water businesses (Moon, Venus)
  const liquidAnalysis = analyzeLiquidBusiness(kundali, numerology)
  if (liquidAnalysis.compatibility > 60) {
    analyses.push(liquidAnalysis)
  }

  // Fire businesses (Sun, Mars)
  const fireAnalysis = analyzeFireBusiness(kundali, numerology)
  if (fireAnalysis.compatibility > 60) {
    analyses.push(fireAnalysis)
  }

  // Tech businesses (Mercury, Rahu)
  const techAnalysis = analyzeTechBusiness(kundali, numerology)
  if (techAnalysis.compatibility > 60) {
    analyses.push(techAnalysis)
  }

  // Food businesses (Venus, Moon)
  const foodAnalysis = analyzeFoodBusiness(kundali, numerology)
  if (foodAnalysis.compatibility > 60) {
    analyses.push(foodAnalysis)
  }

  // Retail businesses (Mercury, Venus)
  const retailAnalysis = analyzeRetailBusiness(kundali, numerology)
  if (retailAnalysis.compatibility > 60) {
    analyses.push(retailAnalysis)
  }

  // Service businesses (Jupiter, Mercury)
  const serviceAnalysis = analyzeServiceBusiness(kundali, numerology)
  if (serviceAnalysis.compatibility > 60) {
    analyses.push(serviceAnalysis)
  }

  // Manufacturing (Mars, Saturn)
  const manufacturingAnalysis = analyzeManufacturingBusiness(kundali, numerology)
  if (manufacturingAnalysis.compatibility > 60) {
    analyses.push(manufacturingAnalysis)
  }

  // Real Estate (Saturn, Venus)
  const realEstateAnalysis = analyzeRealEstateBusiness(kundali, numerology)
  if (realEstateAnalysis.compatibility > 60) {
    analyses.push(realEstateAnalysis)
  }

  return analyses.sort((a, b) => b.compatibility - a.compatibility)
}

/**
 * Analyze liquid/water businesses
 */
function analyzeLiquidBusiness(kundali: any, numerology?: any): BusinessNature {
  const moon = kundali.grahas.moon
  const venus = kundali.grahas.venus
  let compatibility = 50

  if (moon?.house === 10 || moon?.house === 2) {
    compatibility += 20
  }

  if (venus?.house === 10 || venus?.house === 2) {
    compatibility += 20
  }

  return {
    type: 'liquid',
    element: 'water',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Moon and Venus influences support liquid/water-based businesses',
    recommendations: [
      'Consider beverages, water treatment, shipping, or marine businesses',
      'Focus on businesses with fluid operations',
    ],
    challenges: ['May need strong financial planning', 'Requires consistent cash flow'],
  }
}

/**
 * Analyze fire businesses
 */
function analyzeFireBusiness(kundali: any, numerology?: any): BusinessNature {
  const sun = kundali.grahas.sun
  const mars = kundali.grahas.mars
  let compatibility = 50

  if (sun?.house === 10 || sun?.house === 1) {
    compatibility += 25
  }

  if (mars?.house === 10 || mars?.house === 1) {
    compatibility += 25
  }

  return {
    type: 'fire',
    element: 'fire',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Sun and Mars provide strong fire energy for dynamic businesses',
    recommendations: [
      'Consider energy, technology, entertainment, or fast-paced industries',
      'Focus on businesses requiring passion and drive',
    ],
    challenges: ['May need to manage energy levels', 'Requires quick decision-making'],
  }
}

/**
 * Analyze tech businesses
 */
function analyzeTechBusiness(kundali: any, numerology?: any): BusinessNature {
  const mercury = kundali.grahas.mercury
  const rahu = kundali.grahas.rahu
  let compatibility = 50

  if (mercury?.house === 10 || mercury?.house === 3) {
    compatibility += 25
  }

  if (rahu?.house === 10 || rahu?.house === 11) {
    compatibility += 20
  }

  if (numerology?.lifePathNumber === 5 || numerology?.destinyNumber === 5) {
    compatibility += 10
  }

  return {
    type: 'tech',
    element: 'air',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Mercury and Rahu support technology and innovation',
    recommendations: [
      'Consider software, IT services, digital marketing, or AI businesses',
      'Focus on cutting-edge technology and innovation',
    ],
    challenges: ['Rapid changes require adaptability', 'Need continuous learning'],
  }
}

/**
 * Analyze food businesses
 */
function analyzeFoodBusiness(kundali: any, numerology?: any): BusinessNature {
  const venus = kundali.grahas.venus
  const moon = kundali.grahas.moon
  let compatibility = 50

  if (venus?.house === 10 || venus?.house === 2) {
    compatibility += 25
  }

  if (moon?.house === 10 || moon?.house === 2) {
    compatibility += 20
  }

  return {
    type: 'food',
    element: 'earth',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Venus and Moon support food and hospitality businesses',
    recommendations: [
      'Consider restaurants, catering, food delivery, or agriculture',
      'Focus on quality and customer satisfaction',
    ],
    challenges: ['Requires attention to quality', 'May have seasonal variations'],
  }
}

/**
 * Analyze retail businesses
 */
function analyzeRetailBusiness(kundali: any, numerology?: any): BusinessNature {
  const mercury = kundali.grahas.mercury
  const venus = kundali.grahas.venus
  let compatibility = 50

  if (mercury?.house === 10 || mercury?.house === 2) {
    compatibility += 20
  }

  if (venus?.house === 10 || venus?.house === 2) {
    compatibility += 20
  }

  return {
    type: 'retail',
    element: 'earth',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Mercury and Venus support retail and commerce',
    recommendations: [
      'Consider retail stores, e-commerce, or trading businesses',
      'Focus on customer service and product quality',
    ],
    challenges: ['Competitive market', 'Requires good inventory management'],
  }
}

/**
 * Analyze service businesses
 */
function analyzeServiceBusiness(kundali: any, numerology?: any): BusinessNature {
  const jupiter = kundali.grahas.jupiter
  const mercury = kundali.grahas.mercury
  let compatibility = 50

  if (jupiter?.house === 10 || jupiter?.house === 6) {
    compatibility += 25
  }

  if (mercury?.house === 10 || mercury?.house === 6) {
    compatibility += 20
  }

  return {
    type: 'service',
    element: 'air',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Jupiter and Mercury support service-oriented businesses',
    recommendations: [
      'Consider consulting, education, healthcare, or professional services',
      'Focus on expertise and client relationships',
    ],
    challenges: ['Requires expertise', 'May need certification or credentials'],
  }
}

/**
 * Analyze manufacturing businesses
 */
function analyzeManufacturingBusiness(kundali: any, numerology?: any): BusinessNature {
  const mars = kundali.grahas.mars
  const saturn = kundali.grahas.saturn
  let compatibility = 50

  if (mars?.house === 10 || mars?.house === 6) {
    compatibility += 20
  }

  if (saturn?.house === 10 || saturn?.house === 6) {
    compatibility += 25
  }

  return {
    type: 'manufacturing',
    element: 'earth',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Mars and Saturn support manufacturing and production',
    recommendations: [
      'Consider manufacturing, construction, or production businesses',
      'Focus on efficiency and quality control',
    ],
    challenges: ['Requires capital investment', 'May have long production cycles'],
  }
}

/**
 * Analyze real estate businesses
 */
function analyzeRealEstateBusiness(kundali: any, numerology?: any): BusinessNature {
  const saturn = kundali.grahas.saturn
  const venus = kundali.grahas.venus
  let compatibility = 50

  if (saturn?.house === 10 || saturn?.house === 4) {
    compatibility += 25
  }

  if (venus?.house === 10 || venus?.house === 4) {
    compatibility += 20
  }

  return {
    type: 'real-estate',
    element: 'earth',
    compatibility: Math.min(compatibility, 100),
    reasoning: 'Saturn and Venus support real estate and property businesses',
    recommendations: [
      'Consider real estate, property development, or construction',
      'Focus on long-term investments and property management',
    ],
    challenges: ['Requires significant capital', 'Long-term investment cycles'],
  }
}

