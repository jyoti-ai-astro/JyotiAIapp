/**
 * JyotiAI Language Architecture Types
 * 
 * Implements canonical MultilingualTurn envelope and language intelligence contracts
 * specified in Architecture Decision Handoff Section 10.
 */

import type { ScriptType, SupportedLocale, IndicLanguageWave } from '../../i18n/config'

export type { ScriptType, SupportedLocale, IndicLanguageWave }

export type AstrologyGlossaryCategory =
  | 'graha'
  | 'rashi'
  | 'nakshatra'
  | 'dasha'
  | 'bhava'
  | 'dosha_yoga'
  | 'muhurta'

/**
 * Recognized astrological entity in user input or system response
 */
export interface RecognizedAstrologyTerm {
  canonicalKey: string
  originalToken: string
  category: AstrologyGlossaryCategory
  devanagari: string
  iast: string
  doNotTranslate: boolean
}

/**
 * Canonical Multilingual Turn Envelope
 * 
 * Preserves the original user wording while enriching with script, code-mix,
 * normalized semantic query, and response language preferences.
 */
export interface MultilingualTurn {
  /** The exact raw text entered by user */
  originalText: string
  /** Detected language codes (e.g. ['hi', 'en']) */
  detectedLanguages: string[]
  /** Primary resolved BCP-47 locale (e.g. 'en-IN', 'hi-IN', 'hi-Latn') */
  primaryLocale: SupportedLocale
  /** Script detected in the input */
  script: ScriptType
  /** Whether the turn is code-mixed (e.g. Hinglish, English words in Hindi) */
  codeMixed: boolean
  /** Canonical English query for downstream semantic search and RAG retrieval */
  canonicalEnglish?: string
  /** Normalized native text with standardized transliteration */
  normalizedNative?: string
  /** Target BCP-47 locale for the assistant response */
  responseLocale: SupportedLocale
  /** Preferred script for the response (e.g. 'devanagari', 'latin') */
  responseScriptPreference?: ScriptType
  /** Confidence score of detection (0.0 - 1.0) */
  confidence: number
  /** Astrological terms identified in the message */
  astrologyEntities?: RecognizedAstrologyTerm[]
}

/**
 * Script and language detection result
 */
export interface LanguageDetectionResult {
  primaryLanguage: string
  primaryLocale: SupportedLocale
  script: ScriptType
  isCodeMixed: boolean
  languages: string[]
  confidence: number
  indicWave: IndicLanguageWave
}

/**
 * Request to process a user turn through the Language Gateway
 */
export interface LanguageGatewayRequest {
  text: string
  history?: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    locale?: SupportedLocale
  }>
  userPreferredLocale?: SupportedLocale | string | null
  responseStyle?: 'formal' | 'warm' | 'spiritual'
}

/**
 * Full result from the Language Gateway
 */
export interface LanguageGatewayResult {
  turn: MultilingualTurn
  systemPromptInstructions?: string
  enhancedQuery?: string
}

/**
 * Curated Astrology Glossary Entry
 */
export interface AstrologyGlossaryEntry {
  key: string
  canonicalEnglish: string
  devanagari: string
  iast: string
  commonVariants: readonly string[]
  category: AstrologyGlossaryCategory
  meaning: string
  doNotTranslate: boolean
}
