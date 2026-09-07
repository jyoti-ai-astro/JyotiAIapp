/**
 * JyotiAI i18n Configuration & BCP-47 Locales
 * 
 * Supports phased Indic language rollouts:
 * - Wave 1: English (India), Hindi (Devanagari), Hinglish (Romanized Hindi)
 * - Wave 2: Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi
 * - Wave 3: Remaining 22 scheduled Indian languages (Sanskrit, Odia, Assamese, etc.)
 */

export type ScriptType =
  | 'latin'
  | 'devanagari'
  | 'bengali'
  | 'tamil'
  | 'telugu'
  | 'gujarati'
  | 'kannada'
  | 'malayalam'
  | 'gurmukhi'
  | 'odia'
  | 'other'

export type IndicLanguageWave = 'wave1' | 'wave2' | 'wave3'

export interface LocaleMetadata {
  code: string
  bcp47: string
  name: string
  nativeName: string
  script: ScriptType
  direction: 'ltr' | 'rtl'
  wave: IndicLanguageWave
  isAvailable: boolean
  flagEmoji?: string
}

/**
 * Wave 1 locales with full UI message catalog support
 */
export const WAVE_1_LOCALES = ['en-IN', 'hi-IN', 'hi-Latn'] as const
export type Wave1Locale = (typeof WAVE_1_LOCALES)[number]

/**
 * Wave 2 scheduled Indic languages
 */
export const WAVE_2_LOCALES = [
  'bn-IN',
  'mr-IN',
  'gu-IN',
  'ta-IN',
  'te-IN',
  'kn-IN',
  'ml-IN',
  'pa-IN',
] as const
export type Wave2Locale = (typeof WAVE_2_LOCALES)[number]

/**
 * Wave 3 scheduled Indic languages
 */
export const WAVE_3_LOCALES = [
  'sa-IN',
  'or-IN',
  'as-IN',
  'ur-IN',
  'mai-IN',
  'bho-IN',
] as const
export type Wave3Locale = (typeof WAVE_3_LOCALES)[number]

export const ALL_SUPPORTED_LOCALES = [
  ...WAVE_1_LOCALES,
  ...WAVE_2_LOCALES,
  ...WAVE_3_LOCALES,
] as const

export type SupportedLocale = (typeof ALL_SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = 'en-IN'
export const FALLBACK_LOCALE: SupportedLocale = 'en-IN'

/**
 * Metadata table for all BCP-47 locales in JyotiAI
 */
export const LOCALE_REGISTRY: Record<SupportedLocale, LocaleMetadata> = {
  'en-IN': {
    code: 'en-IN',
    bcp47: 'en-IN',
    name: 'English (India)',
    nativeName: 'English (India)',
    script: 'latin',
    direction: 'ltr',
    wave: 'wave1',
    isAvailable: true,
    flagEmoji: '🇮🇳',
  },
  'hi-IN': {
    code: 'hi-IN',
    bcp47: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'devanagari',
    direction: 'ltr',
    wave: 'wave1',
    isAvailable: true,
    flagEmoji: '🇮🇳',
  },
  'hi-Latn': {
    code: 'hi-Latn',
    bcp47: 'hi-Latn',
    name: 'Hinglish',
    nativeName: 'Hinglish',
    script: 'latin',
    direction: 'ltr',
    wave: 'wave1',
    isAvailable: true,
    flagEmoji: '🇮🇳',
  },
  'bn-IN': {
    code: 'bn-IN',
    bcp47: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'bengali',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'mr-IN': {
    code: 'mr-IN',
    bcp47: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'devanagari',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'gu-IN': {
    code: 'gu-IN',
    bcp47: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'gujarati',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'ta-IN': {
    code: 'ta-IN',
    bcp47: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'tamil',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'te-IN': {
    code: 'te-IN',
    bcp47: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'telugu',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'kn-IN': {
    code: 'kn-IN',
    bcp47: 'kn-IN',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'kannada',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'ml-IN': {
    code: 'ml-IN',
    bcp47: 'ml-IN',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'malayalam',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'pa-IN': {
    code: 'pa-IN',
    bcp47: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'gurmukhi',
    direction: 'ltr',
    wave: 'wave2',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'sa-IN': {
    code: 'sa-IN',
    bcp47: 'sa-IN',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    script: 'devanagari',
    direction: 'ltr',
    wave: 'wave3',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'or-IN': {
    code: 'or-IN',
    bcp47: 'or-IN',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'odia',
    direction: 'ltr',
    wave: 'wave3',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'as-IN': {
    code: 'as-IN',
    bcp47: 'as-IN',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    script: 'bengali',
    direction: 'ltr',
    wave: 'wave3',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'ur-IN': {
    code: 'ur-IN',
    bcp47: 'ur-IN',
    name: 'Urdu',
    nativeName: 'اردو',
    script: 'other',
    direction: 'rtl',
    wave: 'wave3',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'mai-IN': {
    code: 'mai-IN',
    bcp47: 'mai-IN',
    name: 'Maithili',
    nativeName: 'मैथिली',
    script: 'devanagari',
    direction: 'ltr',
    wave: 'wave3',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
  'bho-IN': {
    code: 'bho-IN',
    bcp47: 'bho-IN',
    name: 'Bhojpuri',
    nativeName: 'भोजपुरी',
    script: 'devanagari',
    direction: 'ltr',
    wave: 'wave3',
    isAvailable: false,
    flagEmoji: '🇮🇳',
  },
}

/**
 * Check if a locale string is supported in the system
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return Object.prototype.hasOwnProperty.call(LOCALE_REGISTRY, locale)
}

/**
 * Check if a locale is an active Wave 1 locale
 */
export function isWave1Locale(locale: string): locale is Wave1Locale {
  return (WAVE_1_LOCALES as readonly string[]).includes(locale)
}

/**
 * Normalizes user/browser input locale to a canonical JyotiAI SupportedLocale
 * Handles variations: 'hi', 'hi-IN', 'hi_in', 'hindi', 'hinglish', 'hi-Latn', 'en', 'en-US' -> 'en-IN'
 */
export function normalizeLocale(input?: string | null): SupportedLocale {
  if (!input) return DEFAULT_LOCALE

  const clean = input.trim().toLowerCase().replace('_', '-')

  if (clean === 'en' || clean === 'en-in' || clean === 'en-us' || clean === 'en-gb' || clean === 'english') {
    return 'en-IN'
  }

  if (clean === 'hi' || clean === 'hi-in' || clean === 'hindi' || clean === 'hin') {
    return 'hi-IN'
  }

  if (
    clean === 'hi-latn' ||
    clean === 'hinglish' ||
    clean === 'hi-en' ||
    clean === 'en-hi' ||
    clean === 'roman-hindi'
  ) {
    return 'hi-Latn'
  }

  if (clean === 'bn' || clean === 'bn-in' || clean === 'bengali') return 'bn-IN'
  if (clean === 'mr' || clean === 'mr-in' || clean === 'marathi') return 'mr-IN'
  if (clean === 'gu' || clean === 'gu-in' || clean === 'gujarati') return 'gu-IN'
  if (clean === 'ta' || clean === 'ta-in' || clean === 'tamil') return 'ta-IN'
  if (clean === 'te' || clean === 'te-in' || clean === 'telugu') return 'te-IN'
  if (clean === 'kn' || clean === 'kn-in' || clean === 'kannada') return 'kn-IN'
  if (clean === 'ml' || clean === 'ml-in' || clean === 'malayalam') return 'ml-IN'
  if (clean === 'pa' || clean === 'pa-in' || clean === 'punjabi') return 'pa-IN'
  if (clean === 'sa' || clean === 'sa-in' || clean === 'sanskrit') return 'sa-IN'

  // Exact lookup in LOCALE_REGISTRY (case-insensitive)
  const match = (ALL_SUPPORTED_LOCALES as readonly string[]).find(
    (loc) => loc.toLowerCase() === clean
  )
  if (match && isSupportedLocale(match)) {
    return match
  }

  return DEFAULT_LOCALE
}

/**
 * Returns available locales ready for UI consumption (Wave 1)
 */
export function getAvailableLocales(): LocaleMetadata[] {
  return WAVE_1_LOCALES.map((code) => LOCALE_REGISTRY[code])
}
