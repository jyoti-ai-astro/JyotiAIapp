/**
 * Side Hustle Engine
 * Part B - Section 4: Kundali Engine
 * Milestone 8 - Step 5
 * 
 * Recommends suitable side hustles based on astrological profile
 */

export interface SideHustle {
  name: string
  category: string
  compatibility: number
  reasoning: string
  timeCommitment: 'low' | 'medium' | 'high'
  incomePotential: 'low' | 'medium' | 'high'
  startupCost: 'low' | 'medium' | 'high'
  skills: string[]
  recommendations: string[]
}

/**
 * Generate side hustle recommendations
 */
export function generateSideHustles(
  kundali: {
    grahas: Record<string, any>
    bhavas: Record<string, any>
  },
  numerology?: {
    lifePathNumber: number
    destinyNumber: number
  }
): SideHustle[] {
  const hustles: SideHustle[] = []

  const sun = kundali.grahas.sun
  const moon = kundali.grahas.moon
  const mercury = kundali.grahas.mercury
  const venus = kundali.grahas.venus
  const jupiter = kundali.grahas.jupiter

  // Content Creation (Mercury, Venus)
  if (mercury?.house === 3 || venus?.house === 5) {
    hustles.push({
      name: 'Content Creation / Blogging',
      category: 'creative',
      compatibility: 85,
      reasoning: 'Mercury and Venus support communication and creativity',
      timeCommitment: 'medium',
      incomePotential: 'medium',
      startupCost: 'low',
      skills: ['Writing', 'Social Media', 'Content Strategy'],
      recommendations: ['Start a blog or YouTube channel', 'Focus on your expertise area'],
    })
  }

  // Consulting (Jupiter, Mercury)
  if (jupiter?.house === 10 || mercury?.house === 10) {
    hustles.push({
      name: 'Freelance Consulting',
      category: 'service',
      compatibility: 80,
      reasoning: 'Jupiter and Mercury support knowledge-based services',
      timeCommitment: 'medium',
      incomePotential: 'high',
      startupCost: 'low',
      skills: ['Expertise in your field', 'Communication', 'Client Management'],
      recommendations: ['Leverage your professional expertise', 'Build a portfolio'],
    })
  }

  // Online Teaching (Jupiter, Moon)
  if (jupiter?.house === 5 || moon?.house === 5) {
    hustles.push({
      name: 'Online Teaching / Courses',
      category: 'education',
      compatibility: 85,
      reasoning: 'Jupiter and Moon support teaching and sharing knowledge',
      timeCommitment: 'high',
      incomePotential: 'high',
      startupCost: 'low',
      skills: ['Teaching', 'Content Creation', 'Platform Management'],
      recommendations: ['Create online courses', 'Offer tutoring services'],
    })
  }

  // E-commerce (Mercury, Venus)
  if (mercury?.house === 2 || venus?.house === 2) {
    hustles.push({
      name: 'E-commerce / Dropshipping',
      category: 'retail',
      compatibility: 75,
      reasoning: 'Mercury and Venus support commerce and retail',
      timeCommitment: 'medium',
      incomePotential: 'medium',
      startupCost: 'medium',
      skills: ['Marketing', 'Product Research', 'Customer Service'],
      recommendations: ['Start with niche products', 'Focus on digital marketing'],
    })
  }

  // Astrology Services (Jupiter, Moon)
  if (jupiter?.house === 9 || moon?.house === 9) {
    hustles.push({
      name: 'Astrology / Spiritual Services',
      category: 'spiritual',
      compatibility: 90,
      reasoning: 'Jupiter and Moon in 9th house support spiritual services',
      timeCommitment: 'medium',
      incomePotential: 'medium',
      startupCost: 'low',
      skills: ['Astrology Knowledge', 'Counseling', 'Communication'],
      recommendations: ['Offer online consultations', 'Create spiritual content'],
    })
  }

  // Photography (Venus, Moon)
  if (venus?.house === 5 || moon?.house === 5) {
    hustles.push({
      name: 'Photography / Videography',
      category: 'creative',
      compatibility: 80,
      reasoning: 'Venus and Moon support artistic pursuits',
      timeCommitment: 'medium',
      incomePotential: 'medium',
      startupCost: 'medium',
      skills: ['Photography', 'Editing', 'Client Management'],
      recommendations: ['Build a portfolio', 'Offer event photography'],
    })
  }

  // Digital Marketing (Mercury, Rahu)
  const rahu = kundali.grahas.rahu
  if (mercury?.house === 10 || rahu?.house === 10) {
    hustles.push({
      name: 'Digital Marketing Services',
      category: 'tech',
      compatibility: 85,
      reasoning: 'Mercury and Rahu support digital and marketing skills',
      timeCommitment: 'medium',
      incomePotential: 'high',
      startupCost: 'low',
      skills: ['SEO', 'Social Media', 'Content Marketing'],
      recommendations: ['Offer social media management', 'Provide SEO services'],
    })
  }

  // Numerology compatibility
  if (numerology?.lifePathNumber === 3 || numerology?.lifePathNumber === 6) {
    hustles.push({
      name: 'Arts & Crafts / Handmade Products',
      category: 'creative',
      compatibility: 75,
      reasoning: 'Life Path 3 or 6 supports creative endeavors',
      timeCommitment: 'high',
      incomePotential: 'medium',
      startupCost: 'low',
      skills: ['Crafting', 'Design', 'Marketing'],
      recommendations: ['Sell on Etsy or similar platforms', 'Focus on unique products'],
    })
  }

  return hustles.sort((a, b) => b.compatibility - a.compatibility)
}

