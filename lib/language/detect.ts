/**
 * Language & Script Detection Engine
 * 
 * Accurately detects:
 * - Unicode script (Devanagari, Latin, Bengali, Tamil, Telugu, etc.)
 * - Code-mixing (Hinglish, mixed English/Hindi)
 * - Vocabulary-based language detection for Indian conversational queries
 */

import {
  LOCALE_REGISTRY,
  normalizeLocale,
  type ScriptType,
  type SupportedLocale,
  type IndicLanguageWave,
} from '../../i18n/config'
import type { LanguageDetectionResult } from './types'

// Distinctive Hinglish / Romanized Hindi grammatical markers (pronouns, verbs, postpositions, question words)
const HINGLISH_MARKERS = new Set([
  'kya', 'hai', 'hain', 'ho', 'hun', 'hoon', 'kaisa', 'kaisi', 'kaise',
  'mera', 'meri', 'mere', 'mujhe', 'hum', 'humein', 'aap', 'aapka', 'aapki',
  'tum', 'tumhara', 'tumhari', 'tera', 'teri', 'tere',
  'batao', 'bataiye', 'bolo', 'boliye', 'dekho', 'dekh', 'karo', 'kariye', 'kare', 'karein',
  'mein', 'mai', 'pe', 'se', 'ko', 'ki', 'ke', 'ka',
  'kab', 'hoga', 'hogi', 'honge', 'tha', 'thi',
  'nahi', 'nahin', 'na', 'mat', 'kyun', 'kyu', 'kaun', 'kaunsa', 'kaunsi',
  'aaj', 'kal', 'ab', 'tab', 'jab', 'phir', 'toh', 'bhi',
  'kuch', 'accha', 'achha', 'bura', 'kharab', 'bahut', 'bohot', 'thoda', 'zyada',
  'shaadi', 'shadi', 'vivah', 'naukri', 'paisa', 'paise',
  'samay', 'shubh', 'upay', 'puja', 'pooja',
  'kundli', 'kundali', 'rashi', 'nakshatra', 'dasha', 'mahadasha',
  'lagna', 'graha', 'grah', 'bhav', 'bhava', 'manglik', 'sade', 'sati',
])

// English common function and content words
const ENGLISH_COMMON_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in',
  'with', 'to', 'for', 'of', 'about', 'what', 'when', 'where', 'how',
  'why', 'who', 'will', 'can', 'should', 'would', 'could', 'my', 'your',
  'his', 'her', 'their', 'our', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'tell', 'me', 'explain', 'please', 'help', 'effect', 'future', 'prediction',
  'house', 'planet', 'chart', 'horoscope', 'career', 'job',
])

/**
 * Detect primary script in text based on Unicode character counts
 */
export function detectScript(text: string): ScriptType {
  if (!text || !text.trim()) return 'latin'

  let devanagariCount = 0
  let bengaliCount = 0
  let tamilCount = 0
  let teluguCount = 0
  let gujaratiCount = 0
  let kannadaCount = 0
  let malayalamCount = 0
  let gurmukhiCount = 0
  let odiaCount = 0
  let latinCount = 0

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 0x0900 && code <= 0x097f) devanagariCount++
    else if (code >= 0x0980 && code <= 0x09ff) bengaliCount++
    else if (code >= 0x0a00 && code <= 0x0a7f) gurmukhiCount++
    else if (code >= 0x0a80 && code <= 0x0aff) gujaratiCount++
    else if (code >= 0x0b00 && code <= 0x0b7f) odiaCount++
    else if (code >= 0x0b80 && code <= 0x0bff) tamilCount++
    else if (code >= 0x0c00 && code <= 0x0c7f) teluguCount++
    else if (code >= 0x0c80 && code <= 0x0cff) kannadaCount++
    else if (code >= 0x0d00 && code <= 0x0d7f) malayalamCount++
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) latinCount++
  }

  const counts: Array<[ScriptType, number]> = [
    ['devanagari', devanagariCount],
    ['bengali', bengaliCount],
    ['tamil', tamilCount],
    ['telugu', teluguCount],
    ['gujarati', gujaratiCount],
    ['kannada', kannadaCount],
    ['malayalam', malayalamCount],
    ['gurmukhi', gurmukhiCount],
    ['odia', odiaCount],
    ['latin', latinCount],
  ]

  counts.sort((a, b) => b[1] - a[1])
  const [topScript, topCount] = counts[0]

  return topCount > 0 ? topScript : 'latin'
}

/**
 * Identify language, script, code-mixing, and target locale for an input query
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || !text.trim()) {
    return {
      primaryLanguage: 'en',
      primaryLocale: 'en-IN',
      script: 'latin',
      isCodeMixed: false,
      languages: ['en'],
      confidence: 1.0,
      indicWave: 'wave1',
    }
  }

  const script = detectScript(text)

  // Non-Latin Indic scripts directly map to their primary Indic languages
  if (script === 'devanagari') {
    const hasLatinWords = /[a-zA-Z]{2,}/.test(text)
    return {
      primaryLanguage: 'hi',
      primaryLocale: 'hi-IN',
      script: 'devanagari',
      isCodeMixed: hasLatinWords,
      languages: hasLatinWords ? ['hi', 'en'] : ['hi'],
      confidence: 0.95,
      indicWave: 'wave1',
    }
  }

  if (script === 'bengali') {
    return {
      primaryLanguage: 'bn',
      primaryLocale: 'bn-IN',
      script: 'bengali',
      isCodeMixed: /[a-zA-Z]{2,}/.test(text),
      languages: ['bn'],
      confidence: 0.9,
      indicWave: 'wave2',
    }
  }

  if (script === 'tamil') {
    return {
      primaryLanguage: 'ta',
      primaryLocale: 'ta-IN',
      script: 'tamil',
      isCodeMixed: /[a-zA-Z]{2,}/.test(text),
      languages: ['ta'],
      confidence: 0.9,
      indicWave: 'wave2',
    }
  }

  if (script === 'telugu') {
    return {
      primaryLanguage: 'te',
      primaryLocale: 'te-IN',
      script: 'telugu',
      isCodeMixed: /[a-zA-Z]{2,}/.test(text),
      languages: ['te'],
      confidence: 0.9,
      indicWave: 'wave2',
    }
  }

  // Latin script: Evaluate English vs Hinglish
  const words = text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0)

  if (words.length === 0) {
    return {
      primaryLanguage: 'en',
      primaryLocale: 'en-IN',
      script: 'latin',
      isCodeMixed: false,
      languages: ['en'],
      confidence: 0.5,
      indicWave: 'wave1',
    }
  }

  let hinglishMatches = 0
  let englishMatches = 0

  for (const word of words) {
    if (HINGLISH_MARKERS.has(word)) {
      hinglishMatches++
    }
    if (ENGLISH_COMMON_WORDS.has(word)) {
      englishMatches++
    }
  }

  const hinglishRatio = hinglishMatches / words.length

  // Hinglish classification requires either:
  // 1. Predominantly Hinglish markers with few/no English grammatical words, OR
  // 2. Clear presence of Hindi markers exceeding English markers, OR
  // 3. Significant proportion (>= 25%) of Hindi markers
  const isHinglish =
    (hinglishMatches >= 1 && englishMatches === 0) ||
    (hinglishMatches >= 2 && hinglishMatches >= englishMatches) ||
    (hinglishMatches >= 1 && hinglishRatio >= 0.25)

  const isCodeMixed = (isHinglish && englishMatches > 0) || (englishMatches > 0 && hinglishMatches > 0)

  if (isHinglish) {
    return {
      primaryLanguage: 'hi',
      primaryLocale: 'hi-Latn',
      script: 'latin',
      isCodeMixed,
      languages: ['hi', 'en'],
      confidence: Math.min(0.6 + hinglishRatio * 0.4, 0.95),
      indicWave: 'wave1',
    }
  }

  // English in Latin script (may have embedded Sanskrit/Hindi terms)
  return {
    primaryLanguage: 'en',
    primaryLocale: 'en-IN',
    script: 'latin',
    isCodeMixed,
    languages: isCodeMixed ? ['en', 'hi'] : ['en'],
    confidence: 0.9,
    indicWave: 'wave1',
  }
}

/**
 * Check if a text is code-mixed Hinglish
 */
export function isCodeMixedHinglish(text: string): boolean {
  const result = detectLanguage(text)
  return result.primaryLocale === 'hi-Latn' || (result.isCodeMixed && result.script === 'latin')
}
