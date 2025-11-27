/**
 * Application-wide constants
 */

export const APP_NAME = 'Jyoti.ai'
export const APP_DESCRIPTION = 'Your Spiritual Operating System'

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  PRO_MONTHLY: {
    id: 'pro_monthly',
    name: 'PRO Monthly',
    price: 299,
    currency: 'INR',
    duration: 30, // days
  },
  PRO_YEARLY: {
    id: 'pro_yearly',
    name: 'PRO Yearly',
    price: 2499,
    currency: 'INR',
    duration: 365, // days
  },
  PRO_LIFETIME: {
    id: 'pro_lifetime',
    name: 'PRO Lifetime',
    price: 6999,
    currency: 'INR',
    duration: null, // unlimited
  },
} as const

// Report Pricing
export const REPORT_PRICES = {
  BASIC: 99,
  MID: 199,
  PREMIUM: 499,
  ULTRA: 899,
} as const

// Free User Limits
export const FREE_USER_LIMITS = {
  DAILY_CHAT: 3,
  PALM_SCANS: 1,
  FACE_SCANS: 1,
  AURA_SCANS: 1,
  REPORTS: 0,
} as const

// Notification Types
export const NOTIFICATION_TYPES = [
  'daily_horoscope',
  'daily_numerology',
  'transit_alert',
  'festival_alert',
  'chakra_alert',
  'aura_alert',
  'career_alert',
  'business_alert',
  'pregnancy_alert',
  'relationship_alert',
  'remedy_reminder',
  'side_hustle_alert',
  'health_alert',
  'spiritual_growth',
] as const

// Rashi Names
export const RASHI_NAMES = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const

// Nakshatra Names
export const NAKSHATRA_NAMES = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshta',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const

