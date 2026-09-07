/**
 * JyotiAI Language Gateway Processor
 * 
 * Implements the canonical Language Gateway turn processing specified in
 * the JyotiAI Architecture Decision Handoff.
 * 
 * Processes user messages into enriched MultilingualTurn envelopes, provides
 * LLM system prompt language instructions, and preserves domain astrology terms.
 */

import {
  DEFAULT_LOCALE,
  LOCALE_REGISTRY,
  normalizeLocale,
  type ScriptType,
  type SupportedLocale,
} from '../../i18n/config'
import { detectLanguage } from './detect'
import { findAstrologyTerms } from './glossary'
import { DEFAULT_LANGUAGE_GATEWAY_CONFIG, type LanguageGatewayConfig } from './config'
import type {
  LanguageGatewayRequest,
  LanguageGatewayResult,
  MultilingualTurn,
  RecognizedAstrologyTerm,
} from './types'

/**
 * Generate LLM system prompt instructions for language and script behavior
 */
function buildSystemPromptInstructions(
  responseLocale: SupportedLocale,
  script: ScriptType,
  astrologyEntities: RecognizedAstrologyTerm[],
  responseStyle?: 'formal' | 'warm' | 'spiritual'
): string {
  const meta = LOCALE_REGISTRY[responseLocale] || LOCALE_REGISTRY[DEFAULT_LOCALE]
  const instructions: string[] = []

  if (responseLocale === 'hi-Latn') {
    instructions.push(
      'LANGUAGE: Respond in conversational Hinglish (Hindi written in Roman/Latin script), as commonly used by urban Indian users.'
    )
    instructions.push(
      'STYLE: Keep phrasing natural, warm, and intuitive (e.g., "Aapki kundali me Shani...", "Yeh samay shubh hai").'
    )
  } else if (responseLocale === 'hi-IN') {
    instructions.push(
      `LANGUAGE: Respond in Hindi (हिन्दी) using standard Devanagari script.`
    )
    instructions.push(
      'STYLE: Use clear, respectful, and culturally authentic Hindi vocabulary.'
    )
  } else {
    instructions.push(
      `LANGUAGE: Respond in Indian English (${meta.name}), formatted cleanly for Indian readers.`
    )
  }

  if (responseStyle === 'spiritual') {
    instructions.push(
      'TONE: Maintain a reverent, compassionate, and spiritually uplifting tone rooted in Vedic principles.'
    )
  } else if (responseStyle === 'formal') {
    instructions.push('TONE: Maintain an objective, professional, and clear tone.')
  } else {
    instructions.push('TONE: Be warm, empathetic, respectful, and encouraging.')
  }

  if (astrologyEntities.length > 0) {
    const termDescriptions = astrologyEntities
      .map((e) => `"${e.originalToken}" (${e.category}: ${e.devanagari} / ${e.iast})`)
      .join(', ')
    instructions.push(
      `ASTROLOGY TERMS: Preserve these sacred Vedic terms without inappropriate literal translation: ${termDescriptions}.`
    )
  }

  return instructions.join('\n')
}

/**
 * Builds an enhanced query for downstream RAG and semantic search
 */
function buildEnhancedQuery(
  originalText: string,
  astrologyEntities: RecognizedAstrologyTerm[]
): string {
  if (astrologyEntities.length === 0) {
    return originalText
  }

  const termsToAdd = astrologyEntities
    .filter((e) => !originalText.toLowerCase().includes(e.canonicalKey.toLowerCase()))
    .map((e) => e.canonicalKey)

  if (termsToAdd.length === 0) {
    return originalText
  }

  return `${originalText} (${termsToAdd.join(' ')})`
}

/**
 * Process a single conversation turn through the Language Gateway
 */
export function processLanguageGatewayTurn(
  request: LanguageGatewayRequest,
  config: Partial<LanguageGatewayConfig> = {}
): LanguageGatewayResult {
  const activeConfig: LanguageGatewayConfig = {
    ...DEFAULT_LANGUAGE_GATEWAY_CONFIG,
    ...config,
  }

  const text = (request.text || '').trim()

  // 1. Detect language, script, and code-mixing
  const detection = detectLanguage(text)

  // 2. Resolve response locale
  let responseLocale: SupportedLocale
  if (request.userPreferredLocale) {
    responseLocale = normalizeLocale(request.userPreferredLocale)
  } else {
    // If Hinglish detected and preference enabled, respond in Hinglish
    if (detection.primaryLocale === 'hi-Latn' && activeConfig.preferHinglishForRomanHindi) {
      responseLocale = 'hi-Latn'
    } else {
      responseLocale = detection.primaryLocale
    }
  }

  // 3. Resolve preferred response script
  const localeMeta = LOCALE_REGISTRY[responseLocale] || LOCALE_REGISTRY[DEFAULT_LOCALE]
  const responseScriptPreference: ScriptType =
    responseLocale === 'hi-Latn' ? 'latin' : localeMeta.script

  // 4. Identify domain astrological entities
  const astrologyEntities = activeConfig.enableGlossaryPreservation
    ? findAstrologyTerms(text)
    : []

  // 5. Build canonical turn envelope
  const turn: MultilingualTurn = {
    originalText: text,
    detectedLanguages: detection.languages,
    primaryLocale: detection.primaryLocale,
    script: detection.script,
    codeMixed: detection.isCodeMixed,
    responseLocale,
    responseScriptPreference,
    confidence: detection.confidence,
    astrologyEntities: astrologyEntities.length > 0 ? astrologyEntities : undefined,
  }

  // 6. Build LLM system prompt instructions
  const systemPromptInstructions = buildSystemPromptInstructions(
    responseLocale,
    responseScriptPreference,
    astrologyEntities,
    request.responseStyle
  )

  // 7. Enhanced query for search/RAG
  const enhancedQuery = buildEnhancedQuery(text, astrologyEntities)

  return {
    turn,
    systemPromptInstructions,
    enhancedQuery,
  }
}
