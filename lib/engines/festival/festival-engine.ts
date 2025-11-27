/**
 * Festival Activation Engine
 * Part B - Section 8: Notifications & Daily Insights
 * Milestone 7 - Step 4
 * 
 * Manages festival information and energy influences
 */

export interface Festival {
  name: string
  date: Date
  type: 'major' | 'minor' | 'regional'
  energy: {
    influence: string
    chakra: string
    element: string
  }
  remedies: string[]
  mantras: string[]
  dos: string[]
  donts: string[]
  dashaSensitivity: string[]
  description: string
}

/**
 * Pre-loaded festival list (simplified - in production, use a database)
 */
const FESTIVALS: Omit<Festival, 'date'>[] = [
  {
    name: 'Diwali',
    type: 'major',
    energy: {
      influence: 'Prosperity, light, victory over darkness',
      chakra: 'Solar Plexus',
      element: 'Fire',
    },
    remedies: ['Light diyas', 'Perform Lakshmi Puja', 'Clean home', 'Donate to charity'],
    mantras: ['Om Shreem Mahalakshmiyei Namaha', 'Om Namo Bhagavate Vasudevaya'],
    dos: ['Light lamps', 'Wear new clothes', 'Share sweets', 'Pray for prosperity'],
    donts: ['Avoid negative thoughts', 'Don\'t quarrel', 'Avoid alcohol'],
    dashaSensitivity: ['Venus', 'Jupiter', 'Sun'],
    description: 'Festival of lights, symbolizing victory of light over darkness.',
  },
  {
    name: 'Holi',
    type: 'major',
    energy: {
      influence: 'Joy, colors, celebration, unity',
      chakra: 'Heart',
      element: 'Water',
    },
    remedies: ['Play with colors', 'Offer prayers', 'Forgive and forget'],
    mantras: ['Om Namo Bhagavate Vasudevaya', 'Hare Krishna Hare Rama'],
    dos: ['Celebrate with colors', 'Share joy', 'Forgive others'],
    donts: ['Avoid conflicts', 'Don\'t waste water', 'Avoid excessive drinking'],
    dashaSensitivity: ['Mars', 'Venus'],
    description: 'Festival of colors celebrating spring and unity.',
  },
  {
    name: 'Navratri',
    type: 'major',
    energy: {
      influence: 'Divine feminine energy, spiritual growth',
      chakra: 'Crown',
      element: 'Ether',
    },
    remedies: ['Fast', 'Chant mantras', 'Perform puja', 'Meditate'],
    mantras: ['Om Dum Durgayei Namaha', 'Om Aim Hreem Kleem Chamundaye Vichche'],
    dos: ['Observe fast', 'Pray to Goddess', 'Maintain purity', 'Chant mantras'],
    donts: ['Avoid non-vegetarian food', 'Don\'t consume alcohol', 'Avoid negative thoughts'],
    dashaSensitivity: ['Moon', 'Rahu', 'Ketu'],
    description: 'Nine nights dedicated to the Divine Mother.',
  },
  {
    name: 'Ganesha Chaturthi',
    type: 'major',
    energy: {
      influence: 'Wisdom, removal of obstacles, new beginnings',
      chakra: 'Root',
      element: 'Earth',
    },
    remedies: ['Worship Ganesha', 'Chant Ganesha mantras', 'Offer modak'],
    mantras: ['Om Gam Ganapataye Namaha', 'Om Vakratunda Mahakaya'],
    dos: ['Worship Ganesha', 'Chant mantras', 'Offer prayers', 'Seek blessings'],
    donts: ['Avoid negative thoughts', 'Don\'t harm animals', 'Avoid conflicts'],
    dashaSensitivity: ['Mercury', 'Jupiter'],
    description: 'Celebration of Lord Ganesha, remover of obstacles.',
  },
  {
    name: 'Janmashtami',
    type: 'major',
    energy: {
      influence: 'Divine love, devotion, spiritual awakening',
      chakra: 'Heart',
      element: 'Ether',
    },
    remedies: ['Fast', 'Chant Krishna mantras', 'Read Bhagavad Gita', 'Sing bhajans'],
    mantras: ['Om Namo Bhagavate Vasudevaya', 'Hare Krishna Hare Krishna'],
    dos: ['Fast until midnight', 'Chant mantras', 'Read scriptures', 'Sing devotional songs'],
    donts: ['Avoid non-vegetarian food', 'Don\'t consume alcohol', 'Avoid negative thoughts'],
    dashaSensitivity: ['Jupiter', 'Venus'],
    description: 'Birthday of Lord Krishna, celebration of divine love.',
  },
]

/**
 * Get festival for today
 */
export function getFestivalToday(): Festival | null {
  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDate = today.getDate()
  
  // Simplified matching - in production, use proper date calculations
  // This is a placeholder that checks approximate dates
  
  // Diwali (usually October/November)
  if (todayMonth === 10 || todayMonth === 11) {
    if (todayDate >= 20 && todayDate <= 30) {
      return {
        ...FESTIVALS[0],
        date: today,
      }
    }
  }
  
  // Holi (usually March)
  if (todayMonth === 3) {
    if (todayDate >= 1 && todayDate <= 10) {
      return {
        ...FESTIVALS[1],
        date: today,
      }
    }
  }
  
  // Navratri (twice a year - simplified)
  if ((todayMonth === 3 && todayDate >= 20 && todayDate <= 30) ||
      (todayMonth === 10 && todayDate >= 1 && todayDate <= 10)) {
    return {
      ...FESTIVALS[2],
      date: today,
    }
  }
  
  // Ganesha Chaturthi (usually August/September)
  if (todayMonth === 8 || todayMonth === 9) {
    if (todayDate >= 20 && todayDate <= 30) {
      return {
        ...FESTIVALS[3],
        date: today,
      }
    }
  }
  
  // Janmashtami (usually August)
  if (todayMonth === 8) {
    if (todayDate >= 15 && todayDate <= 25) {
      return {
        ...FESTIVALS[4],
        date: today,
      }
    }
  }
  
  return null
}

/**
 * Get upcoming festivals (next 30 days)
 */
export function getUpcomingFestivals(days: number = 30): Festival[] {
  const festivals: Festival[] = []
  const today = new Date()
  
  // Simplified - in production, calculate actual festival dates
  // This is a placeholder
  
  for (let i = 0; i < days; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() + i)
    
    const festival = getFestivalForDate(checkDate)
    if (festival) {
      festivals.push(festival)
    }
  }
  
  return festivals
}

/**
 * Get festival for specific date (simplified)
 */
function getFestivalForDate(date: Date): Festival | null {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // Same logic as getFestivalToday but for specific date
  // This is simplified - use proper calculations in production
  
  if (month === 10 || month === 11) {
    if (day >= 20 && day <= 30) {
      return { ...FESTIVALS[0], date }
    }
  }
  
  if (month === 3) {
    if (day >= 1 && day <= 10) {
      return { ...FESTIVALS[1], date }
    }
  }
  
  // Add more festival checks as needed
  
  return null
}

/**
 * Check if user's Dasha is sensitive to festival
 */
export function checkDashaSensitivity(
  festival: Festival,
  currentDasha: string
): boolean {
  return festival.dashaSensitivity.some(
    (planet) => planet.toLowerCase() === currentDasha.toLowerCase()
  )
}

