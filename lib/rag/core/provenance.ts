/**
 * Corpus Provenance & Shastric Authenticity Foundation
 * 
 * Part of P1-003: Guru / RAG Core Consolidation
 * 
 * Enforces provenance tracking, authenticity tiering, and truth validation
 * across all Vedic textual resources ingested into the knowledge base.
 */

import {
  type AuthenticityTier,
  AUTHENTICITY_TIERS,
  type CorpusProvenance,
  type ProvenanceTruthQuality,
  PROVENANCE_TRUTH_QUALITIES,
  type VedicTradition,
  VEDIC_TRADITIONS,
} from './types'

/**
 * Weights assigned to authenticity tiers for ranking and relevance boosting
 */
export const AUTHENTICITY_TIER_WEIGHTS: Record<AuthenticityTier, number> = {
  TIER_1_CANONICAL_CLASSICAL: 1.30,   // Primary classical Sanskrit shloka / treatise
  TIER_2_COMMENTARY_HERMENEUTIC: 1.15,// Recognized commentary and authoritative translations
  TIER_3_MODERN_SYNTHESIS: 1.00,      // Verified modern astrological research
  TIER_4_HEURISTIC_EXPLORATORY: 0.85, // Dynamic heuristic / exploratory synthesis
}

/**
 * Default truth quality associated with each authenticity tier
 */
export const DEFAULT_TIER_TRUTH_QUALITY: Record<AuthenticityTier, ProvenanceTruthQuality> = {
  TIER_1_CANONICAL_CLASSICAL: 'authoritative',
  TIER_2_COMMENTARY_HERMENEUTIC: 'verified',
  TIER_3_MODERN_SYNTHESIS: 'heuristic',
  TIER_4_HEURISTIC_EXPLORATORY: 'approximate',
}

/**
 * Canonical references metadata for key Vedic traditions
 */
export const TRADITION_CANONICAL_INFO: Record<
  VedicTradition,
  { primaryText: string; primaryAuthor: string; era: string; description: string }
> = {
  PARASHARA: {
    primaryText: 'Brihat Parashara Hora Shastra',
    primaryAuthor: 'Maharishi Parashara',
    era: 'Classical Vedic',
    description: 'Foundational bedrock of Vedic Astrology, Graha nature, Bhavas, Dashas, and Yogas.',
  },
  JAIMINI: {
    primaryText: 'Jaimini Upadesha Sutras',
    primaryAuthor: 'Maharishi Jaimini',
    era: 'Sutra Period',
    description: 'Sutra-based predictive system featuring Chara Dasha, Karakas, and Arudha Padas.',
  },
  VARAHAMIHIRA: {
    primaryText: 'Brihat Jataka',
    primaryAuthor: 'Acharya Varahamihira',
    era: 'Classical Era (6th Century CE)',
    description: 'Masterwork on natal astrology, planetary strengths, longevity, and royal horoscopes.',
  },
  MANTRESWARA: {
    primaryText: 'Phaladeepika',
    primaryAuthor: 'Mantreswara',
    era: 'Medieval Era (13th Century CE)',
    description: 'Standard classical reference for Bhavaphala, Dasha results, Transits, and Upachayas.',
  },
  KALYANA_VARMA: {
    primaryText: 'Saravali',
    primaryAuthor: 'King Kalyana Varma',
    era: 'Classical Era (8th Century CE)',
    description: 'Comprehensive encyclopedia synthesizing ancient classical astrological principles.',
  },
  VAIDYANATHA: {
    primaryText: 'Jataka Parijata',
    primaryAuthor: 'Vaidyanatha Dikshita',
    era: 'Medieval Era (15th Century CE)',
    description: 'Systematic presentation of classical predictive rules, Raja Yogas, and Bhavas.',
  },
  VEDIC_CLASSICAL_GENERAL: {
    primaryText: 'Classical Shastric Compendia',
    primaryAuthor: 'Rishi Tradition',
    era: 'Classical / Pre-Modern',
    description: 'General classical astrological rules and shlokas recognized across traditions.',
  },
  MODERN_VEDIC: {
    primaryText: 'Modern Vedic Astrological Research',
    primaryAuthor: 'Scholarly Lineages (B.V. Raman, K.N. Rao, etc.)',
    era: '20th-21st Century',
    description: 'Contemporary peer-reviewed interpretations, case studies, and statistical validation.',
  },
  SPIRITUAL_HERMENEUTIC: {
    primaryText: 'Upanishadic & Bhagavad Gita Teachings',
    primaryAuthor: 'Vedic Ragas & Rishis',
    era: 'Ancient Vedic',
    description: 'Spiritual, karmic, and philosophical foundations guiding non-fatalistic remedies.',
  },
  PANCHANG_TRADITION: {
    primaryText: 'Surya Siddhanta & Drik Siddhanta',
    primaryAuthor: 'Astronomical Rishi Lineage',
    era: 'Classical Astronomical',
    description: 'Astronomical time measurement, Tithi, Nakshatra, Yoga, and Karana literature.',
  },
}

/**
 * Validation result descriptor
 */
export interface ProvenanceValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validates a CorpusProvenance object against system invariants
 */
export function validateProvenance(provenance: unknown): ProvenanceValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!provenance || typeof provenance !== 'object') {
    return {
      valid: false,
      errors: ['Provenance must be a non-null object'],
      warnings: [],
    }
  }

  const p = provenance as Record<string, any>

  if (!p.sourceId || typeof p.sourceId !== 'string' || p.sourceId.trim().length === 0) {
    errors.push('sourceId is required and must be a non-empty string')
  }

  if (!p.sourceTitle || typeof p.sourceTitle !== 'string' || p.sourceTitle.trim().length === 0) {
    errors.push('sourceTitle is required and must be a non-empty string')
  }

  if (!p.tradition || !VEDIC_TRADITIONS.includes(p.tradition)) {
    errors.push(
      `tradition must be one of: ${VEDIC_TRADITIONS.join(', ')}. Received: ${String(p.tradition)}`
    )
  }

  if (!p.authenticityTier || !AUTHENTICITY_TIERS.includes(p.authenticityTier)) {
    errors.push(
      `authenticityTier must be one of: ${AUTHENTICITY_TIERS.join(', ')}. Received: ${String(p.authenticityTier)}`
    )
  }

  if (p.truthQuality && !PROVENANCE_TRUTH_QUALITIES.includes(p.truthQuality)) {
    errors.push(
      `truthQuality must be one of: ${PROVENANCE_TRUTH_QUALITIES.join(', ')}. Received: ${String(p.truthQuality)}`
    )
  }

  if (p.verificationStatus && !['VERIFIED', 'UNVALIDATED'].includes(p.verificationStatus)) {
    errors.push(`verificationStatus must be 'VERIFIED' or 'UNVALIDATED'. Received: ${String(p.verificationStatus)}`)
  }

  if (!p.licenseOrAttribution || typeof p.licenseOrAttribution !== 'string') {
    errors.push('licenseOrAttribution is required for copyright, public domain, or research citation tracking')
  }

  // Shastric verification sanity checks
  if (p.authenticityTier === 'TIER_1_CANONICAL_CLASSICAL') {
    if (!p.chapter && !p.verseRange) {
      warnings.push('Tier 1 Canonical Classical sources should ideally specify chapter or verseRange for auditability')
    }
    if (!p.shlokaSanskrit && !p.translationEnglish) {
      errors.push('Tier 1 Canonical Classical sources must include either Sanskrit shloka or English translation')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Creates a verified CorpusProvenance instance with defaults
 */
export function createCorpusProvenance(
  input: {
    sourceId: string
    tradition: VedicTradition
    sourceTitle: string
    authenticityTier: AuthenticityTier
    author?: string
    chapter?: string | number
    verseRange?: string
    shlokaSanskrit?: string
    translationEnglish?: string
    commentary?: string
    truthQuality?: ProvenanceTruthQuality
    verificationStatus?: 'VERIFIED' | 'UNVALIDATED'
    licenseOrAttribution?: string
  }
): CorpusProvenance {
  const truthQuality = input.truthQuality || DEFAULT_TIER_TRUTH_QUALITY[input.authenticityTier]
  const verificationStatus = input.verificationStatus || (
    input.authenticityTier === 'TIER_1_CANONICAL_CLASSICAL' ? 'VERIFIED' : 'UNVALIDATED'
  )
  const licenseOrAttribution = input.licenseOrAttribution || 'Vedic Shastric Heritage / Public Domain Citation'

  const provenance: CorpusProvenance = {
    sourceId: input.sourceId.trim(),
    tradition: input.tradition,
    sourceTitle: input.sourceTitle.trim(),
    author: input.author?.trim(),
    chapter: input.chapter,
    verseRange: input.verseRange?.trim(),
    shlokaSanskrit: input.shlokaSanskrit?.trim(),
    translationEnglish: input.translationEnglish?.trim(),
    commentary: input.commentary?.trim(),
    authenticityTier: input.authenticityTier,
    truthQuality,
    verificationStatus,
    licenseOrAttribution,
  }

  const validation = validateProvenance(provenance)
  if (!validation.valid) {
    throw new Error(`Invalid CorpusProvenance: ${validation.errors.join('; ')}`)
  }

  return provenance
}

/**
 * Returns the numerical ranking multiplier for a given authenticity tier
 */
export function getAuthenticityTierWeight(tier: AuthenticityTier): number {
  return AUTHENTICITY_TIER_WEIGHTS[tier] || 1.0
}
