export interface BirthDetails {
  dob: string // YYYY-MM-DD
  tob: string // HH:MM (24-hour format)
  pob: string // Place name
  lat: number
  lng: number
  timezone: string // e.g., "Asia/Kolkata"
}

export interface PlanetPosition {
  name: string
  degree: number
  sign: string
  nakshatra: string
  house: number
  longitude: number
  latitude: number
}

export interface House {
  number: number
  sign: string
  cusp: number
}

export interface KundaliData {
  planets: Record<string, PlanetPosition>
  houses: House[]
  lagna: {
    degree: number
    sign: string
  }
  yogas: Yoga[]
  dasha: DashaPeriod[]
  generatedAt: Date
}

export interface Yoga {
  name: string
  strength: number // 0-100
  meaning: string
  planets: string[]
}

export interface DashaPeriod {
  planet: string
  start: Date
  end: Date
  strength: number
  subPeriods?: DashaPeriod[]
}

export interface Transit {
  planet: string
  currentSign: string
  currentHouse: number
  aspects: Aspect[]
}

export interface Aspect {
  fromPlanet: string
  toPlanet: string
  angle: number
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile'
}

