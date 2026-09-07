/**
 * Hybrid Retrieval Engine
 * 
 * Part of P1-003: Guru / RAG Core Consolidation
 * 
 * Combines:
 * - Deterministic lexical scoring (BM25-style keyword and Vedic entity matching)
 * - Semantic vector similarity (via Pinecone/embeddings when configured)
 * - Reciprocal Rank Fusion (RRF) reranking with graceful degradation
 */

import { rerankCandidates } from './reranker'
import type {
  CorpusChunk,
  HybridQueryParams,
  RerankedResult,
  RetrievalCandidate,
} from './types'

/**
 * Key Vedic astrological terms for entity boosting during lexical search
 */
const VEDIC_ASTROLOGY_KEYWORDS = new Set([
  // Grahas
  'sun', 'surya', 'moon', 'chandra', 'mars', 'mangal', 'mercury', 'budha',
  'jupiter', 'guru', 'brihaspati', 'venus', 'shukra', 'saturn', 'shani',
  'rahu', 'ketu',
  // Rashis
  'mesha', 'aries', 'vrishabha', 'taurus', 'mithuna', 'gemini', 'karka', 'cancer',
  'simha', 'leo', 'kanya', 'virgo', 'tula', 'libra', 'vrishchika', 'scorpio',
  'dhanu', 'sagittarius', 'makara', 'capricorn', 'kumbha', 'aquarius', 'meena', 'pisces',
  // Bhavas & Concepts
  'lagna', 'ascendant', 'bhava', 'house', 'dasha', 'mahadasha', 'antardasha',
  'nakshatra', 'ashwini', 'bharani', 'krittika', 'rohini', 'mrigashira',
  'ardra', 'punarvasu', 'pushya', 'ashlesha', 'magha', 'purva phalguni',
  'uttara phalguni', 'hasta', 'chitra', 'swati', 'vishakha', 'anuradha',
  'jyeshtha', 'mula', 'purva ashadha', 'uttara ashadha', 'shravana',
  'dhanishta', 'shatabhisha', 'purva bhadrapada', 'uttara bhadrapada', 'revati',
  'yoga', 'raja yoga', 'dhana yoga', 'remedy', 'upaya', 'gemstone', 'mantra',
  'kundali', 'horoscope', 'transit', 'gochara', 'exaltation', 'debilitation',
])

/**
 * Normalizes query string into clean tokens
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1)
}

/**
 * Computes deterministic lexical match score for a chunk against a query
 */
export function computeLexicalScore(
  tokens: string[],
  chunk: CorpusChunk
): number {
  if (tokens.length === 0) return 0

  const chunkTextLower = chunk.text.toLowerCase()
  const titleLower = chunk.provenance?.sourceTitle?.toLowerCase() || ''
  const tagsLower = chunk.tags.map((t) => t.toLowerCase())

  let matches = 0
  let exactPhraseBonus = 0
  let entityBonus = 0
  let titleBonus = 0

  // Check complete query phrase in text
  const fullQuery = tokens.join(' ')
  if (fullQuery.length > 4 && chunkTextLower.includes(fullQuery)) {
    exactPhraseBonus += 0.35
  }

  for (const token of tokens) {
    // Exact word boundary or substring match
    if (chunkTextLower.includes(token)) {
      matches++
      // Vedic astrological domain entity boost
      if (VEDIC_ASTROLOGY_KEYWORDS.has(token)) {
        entityBonus += 0.10
      }
    }

    if (titleLower.includes(token)) {
      titleBonus += 0.15
    }

    if (tagsLower.some((tag) => tag.includes(token))) {
      matches += 0.5
    }
  }

  const baseCoverage = matches / tokens.length
  const rawScore = (baseCoverage * 0.5) + exactPhraseBonus + entityBonus + titleBonus

  return Math.min(1.0, Math.max(0, Number(rawScore.toFixed(4))))
}

/**
 * In-memory index store for local/hybrid retrieval
 */
export class CorpusIndexStore {
  private chunks: Map<string, CorpusChunk> = new Map()

  /**
   * Adds or updates chunks in the index
   */
  public addChunks(chunks: CorpusChunk[]): void {
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk)
    }
  }

  /**
   * Retrieves all indexed chunks
   */
  public getAllChunks(): CorpusChunk[] {
    return Array.from(this.chunks.values())
  }

  /**
   * Clears the index
   */
  public clear(): void {
    this.chunks.clear()
  }

  /**
   * Returns total count of indexed chunks
   */
  public size(): number {
    return this.chunks.size
  }

  /**
   * Executes lexical search over indexed chunks
   */
  public searchLexical(
    query: string,
    options?: { mode?: string; minScore?: number; limit?: number }
  ): Array<{ chunk: CorpusChunk; score: number }> {
    const tokens = tokenizeQuery(query)
    const minScore = options?.minScore ?? 0.05
    const limit = options?.limit ?? 20

    const results: Array<{ chunk: CorpusChunk; score: number }> = []

    for (const chunk of this.chunks.values()) {
      if (options?.mode && chunk.mode !== options.mode) {
        continue
      }

      const score = computeLexicalScore(tokens, chunk)
      if (score >= minScore) {
        results.push({ chunk, score })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }
}

/**
 * Global singleton index store
 */
export const defaultIndexStore = new CorpusIndexStore()

/**
 * Executes hybrid retrieval across vector and lexical modalities
 */
export async function executeHybridRetrieval(
  params: HybridQueryParams,
  indexStore: CorpusIndexStore = defaultIndexStore
): Promise<RerankedResult> {
  const {
    query,
    mode,
    astroContextSummary,
    topK = 5,
    minScore = 0.001,
    signal,
  } = params

  const candidateMap = new Map<string, RetrievalCandidate>()

  // 1. Lexical retrieval path (in-memory / fast deterministic)
  const lexicalMatches = indexStore.searchLexical(query, {
    mode,
    minScore: 0.01,
    limit: topK * 3,
  })

  for (const match of lexicalMatches) {
    candidateMap.set(match.chunk.id, {
      chunk: match.chunk,
      lexicalScore: match.score,
      ranks: {},
    })
  }

  // 2. Vector retrieval path (Pinecone if configured)
  let vectorDegraded = false
  try {
    const ragEnabled = process.env.GURU_RAG_ENABLED !== 'false'
    if (ragEnabled && !signal?.aborted) {
      // Dynamic import to avoid hard dependency when testing in memory
      const { getGuruRagContext } = await import('../index')
      const vectorResult = await getGuruRagContext({
        mode: (mode || 'general') as any,
        question: query,
        astroContextSummary,
        topK,
        signal,
      })

      if (vectorResult.degraded) {
        vectorDegraded = true
      }

      // Merge vector results if any
      for (const vectorChunk of vectorResult.chunks) {
        if (!vectorChunk.id) continue

        const existing = candidateMap.get(vectorChunk.id)
        if (existing) {
          existing.semanticScore = vectorChunk.score || 0.5
        } else {
          // Wrap vector chunk into CorpusChunk format if not in indexStore
          const wrappedChunk: CorpusChunk = {
            id: vectorChunk.id,
            documentId: vectorChunk.id.split('_')[0] || 'remote_doc',
            chunkIndex: 0,
            text: vectorChunk.snippet,
            contentHash: '',
            mode: (mode || 'general') as any,
            category: 'general',
            tags: [],
            provenance: {
              sourceId: vectorChunk.source || 'remote_knowledge',
              sourceTitle: vectorChunk.title || 'Vedic Knowledge Corpus',
              tradition: 'VEDIC_CLASSICAL_GENERAL',
              authenticityTier: 'TIER_2_COMMENTARY_HERMENEUTIC',
              truthQuality: 'verified',
              verificationStatus: 'VERIFIED',
              licenseOrAttribution: 'JyotiAI Knowledge Vault',
            },
            tokenCountEstimate: 0,
            byteSize: Buffer.byteLength(vectorChunk.snippet || '', 'utf8'),
            createdAt: new Date().toISOString(),
          }

          candidateMap.set(vectorChunk.id, {
            chunk: wrappedChunk,
            semanticScore: vectorChunk.score || 0.5,
            ranks: {},
          })
        }
      }
    }
  } catch (error) {
    // Vector search failed, continue with lexical matches
    vectorDegraded = true
  }

  const candidateList = Array.from(candidateMap.values())

  // 3. Rerank using Reciprocal Rank Fusion
  const reranked = rerankCandidates(candidateList, {
    targetMode: mode,
    topK,
    minScoreThreshold: minScore,
  })

  return {
    ...reranked,
    degraded: vectorDegraded && candidateList.length === 0,
  }
}
