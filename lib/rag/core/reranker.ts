/**
 * Reciprocal Rank Fusion (RRF) & Multi-Factor Reranker
 * 
 * Part of P1-003: Guru / RAG Core Consolidation
 * 
 * Implements:
 * - Reciprocal Rank Fusion combining disparate retrieval ranks (vector + lexical)
 * - Shastric authenticity tier weighting (Tier 1 Canonical Classical priority)
 * - Guru Mode intent alignment and entity density boosting
 * - Score normalization, thresholding, and top-K selection
 */

import { getAuthenticityTierWeight } from './provenance'
import type {
  CorpusChunk,
  RerankedResult,
  RerankerOptions,
  RetrievalCandidate,
} from './types'

/**
 * Default parameters for RRF and reranking
 */
export const DEFAULT_RERANKER_OPTIONS: Required<RerankerOptions> = {
  k: 60,                // Standard RRF smoothing constant
  semanticWeight: 0.60, // Weight for vector semantic similarity
  lexicalWeight: 0.40,  // Weight for lexical keyword/BM25 matches
  tier1Boost: 1.25,     // Multiplier for Tier 1 Canonical Classical sources
  tier2Boost: 1.10,     // Multiplier for Tier 2 Commentary sources
  modeMatchBoost: 1.15, // Multiplier when chunk mode matches query mode
  minScoreThreshold: 0.001,
}

/**
 * Computes the individual Reciprocal Rank Fusion score for a given rank position.
 * Formula: weight / (k + rank)
 * 
 * @param rank 1-based rank position
 * @param k Smoothing constant (default: 60)
 * @param weight Weight multiplier (default: 1.0)
 */
export function computeRrfComponent(
  rank: number,
  k: number = 60,
  weight: number = 1.0
): number {
  if (rank <= 0) return 0
  return weight / (k + rank)
}

/**
 * Fuses ranked result lists using Reciprocal Rank Fusion
 */
export function fuseRanks(
  semanticRanks: Map<string, number>,
  lexicalRanks: Map<string, number>,
  allChunkIds: string[],
  options?: Pick<RerankerOptions, 'k' | 'semanticWeight' | 'lexicalWeight'>
): Map<string, { rrfScore: number; semanticRank?: number; lexicalRank?: number }> {
  const k = options?.k ?? DEFAULT_RERANKER_OPTIONS.k
  const wSemantic = options?.semanticWeight ?? DEFAULT_RERANKER_OPTIONS.semanticWeight
  const wLexical = options?.lexicalWeight ?? DEFAULT_RERANKER_OPTIONS.lexicalWeight

  const fused = new Map<string, { rrfScore: number; semanticRank?: number; lexicalRank?: number }>()

  for (const id of allChunkIds) {
    const sRank = semanticRanks.get(id)
    const lRank = lexicalRanks.get(id)

    let score = 0
    if (sRank !== undefined) {
      score += computeRrfComponent(sRank, k, wSemantic)
    }
    if (lRank !== undefined) {
      score += computeRrfComponent(lRank, k, wLexical)
    }

    fused.set(id, {
      rrfScore: score,
      semanticRank: sRank,
      lexicalRank: lRank,
    })
  }

  return fused
}

/**
 * Calculates domain-specific provenance and mode multiplier
 */
export function calculateCandidateMultiplier(
  candidate: RetrievalCandidate,
  targetMode?: string,
  options?: RerankerOptions
): number {
  const tier1Boost = options?.tier1Boost ?? DEFAULT_RERANKER_OPTIONS.tier1Boost
  const tier2Boost = options?.tier2Boost ?? DEFAULT_RERANKER_OPTIONS.tier2Boost
  const modeBoost = options?.modeMatchBoost ?? DEFAULT_RERANKER_OPTIONS.modeMatchBoost

  let multiplier = 1.0

  // 1. Authenticity Tier weighting
  const tier = candidate.chunk.provenance?.authenticityTier
  if (tier === 'TIER_1_CANONICAL_CLASSICAL') {
    multiplier *= tier1Boost
  } else if (tier === 'TIER_2_COMMENTARY_HERMENEUTIC') {
    multiplier *= tier2Boost
  } else {
    multiplier *= getAuthenticityTierWeight(tier)
  }

  // 2. Mode alignment
  if (targetMode && candidate.chunk.mode === targetMode) {
    multiplier *= modeBoost
  }

  // 3. Verification status sanity check
  if (candidate.chunk.provenance?.verificationStatus === 'VERIFIED') {
    multiplier *= 1.05
  }

  return multiplier
}

/**
 * Executes multi-factor reranking across retrieval candidates
 */
export function rerankCandidates(
  candidates: RetrievalCandidate[],
  options?: RerankerOptions & { targetMode?: string; topK?: number }
): RerankedResult {
  const startTime = Date.now()
  const topK = options?.topK ?? 5
  const minThreshold = options?.minScoreThreshold ?? DEFAULT_RERANKER_OPTIONS.minScoreThreshold

  if (candidates.length === 0) {
    return {
      chunks: [],
      scores: [],
      candidates: [],
      metrics: {
        totalCandidates: 0,
        semanticMatches: 0,
        lexicalMatches: 0,
        fusedMatches: 0,
        rerankTimeMs: Date.now() - startTime,
      },
      degraded: false,
    }
  }

  // Sort by semantic score descending to establish 1-based semantic rank
  const sortedBySemantic = [...candidates]
    .filter((c) => c.semanticScore !== undefined && c.semanticScore > 0)
    .sort((a, b) => (b.semanticScore || 0) - (a.semanticScore || 0))
  const semanticRankMap = new Map<string, number>()
  sortedBySemantic.forEach((c, idx) => semanticRankMap.set(c.chunk.id, idx + 1))

  // Sort by lexical score descending to establish 1-based lexical rank
  const sortedByLexical = [...candidates]
    .filter((c) => c.lexicalScore !== undefined && c.lexicalScore > 0)
    .sort((a, b) => (b.lexicalScore || 0) - (a.lexicalScore || 0))
  const lexicalRankMap = new Map<string, number>()
  sortedByLexical.forEach((c, idx) => lexicalRankMap.set(c.chunk.id, idx + 1))

  // Compute RRF scores
  const allIds = candidates.map((c) => c.chunk.id)
  const fusedMap = fuseRanks(semanticRankMap, lexicalRankMap, allIds, options)

  // Enrich candidates with RRF and provenance boost
  const scoredCandidates: RetrievalCandidate[] = candidates.map((c) => {
    const fusedInfo = fusedMap.get(c.chunk.id) || { rrfScore: 0 }
    const baseRrf = fusedInfo.rrfScore
    const multiplier = calculateCandidateMultiplier(c, options?.targetMode, options)
    const combinedScore = baseRrf * multiplier

    return {
      ...c,
      combinedScore,
      provenanceBoost: multiplier,
      ranks: {
        semanticRank: fusedInfo.semanticRank,
        lexicalRank: fusedInfo.lexicalRank,
      },
    }
  })

  // Sort by combined score descending
  scoredCandidates.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))

  // Assign final RRF rank
  scoredCandidates.forEach((c, idx) => {
    c.ranks.rrfRank = idx + 1
  })

  // Normalize scores to [0, 1] relative to the maximum observed score
  const maxScore = scoredCandidates[0]?.combinedScore || 1.0
  const normalizedCandidates = scoredCandidates
    .filter((c) => (c.combinedScore || 0) >= minThreshold)
    .slice(0, topK)

  const normalizedScores = normalizedCandidates.map((c) =>
    maxScore > 0 ? Number(((c.combinedScore || 0) / maxScore).toFixed(4)) : 0
  )

  const outputChunks = normalizedCandidates.map((c) => ({
    ...c.chunk,
    // Attach computed score to the chunk
    score: normalizedScores[normalizedCandidates.indexOf(c)],
  }))

  return {
    chunks: outputChunks,
    scores: normalizedScores,
    candidates: normalizedCandidates,
    metrics: {
      totalCandidates: candidates.length,
      semanticMatches: sortedBySemantic.length,
      lexicalMatches: sortedByLexical.length,
      fusedMatches: normalizedCandidates.length,
      rerankTimeMs: Date.now() - startTime,
    },
    degraded: false,
  }
}
