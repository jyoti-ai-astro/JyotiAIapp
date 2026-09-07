/**
 * Guru / RAG Core Consolidation Types
 * 
 * Part of P1-003: Guru / RAG Core Consolidation
 * 
 * Provides typed definitions for:
 * - Corpus Provenance & Shastric Authenticity Tiers
 * - Document & Chunk representations with cryptographic hashing
 * - Hybrid Retrieval Candidates & RRF Reranking
 * - RAG Evaluation Metrics (Faithfulness, Relevance, Recall, Safety)
 * - Jyoti Core Services / Python-Brain Consolidation contract
 */

import type { GuruRagMode } from '../index'

/**
 * Classical and scholarly traditions recognized in the Vedic Corpus
 */
export type VedicTradition =
  | 'PARASHARA'              // Brihat Parashara Hora Shastra (BPHS)
  | 'JAIMINI'                // Jaimini Upadesha Sutras
  | 'VARAHAMIHIRA'           // Brihat Jataka, Brihat Samhita, Laghu Jataka
  | 'MANTRESWARA'            // Phaladeepika
  | 'KALYANA_VARMA'          // Saravali
  | 'VAIDYANATHA'            // Jataka Parijata
  | 'VEDIC_CLASSICAL_GENERAL'// Classical Shastric compendia & Sutras
  | 'MODERN_VEDIC'           // 20th-21st century scholarly commentary (e.g. Raman, Rao)
  | 'SPIRITUAL_HERMENEUTIC'  // Upanishadic / Bhagavad Gita philosophical foundations
  | 'PANCHANG_TRADITION'     // Surya Siddhanta / Drik Ganita textual tradition

export const VEDIC_TRADITIONS: readonly VedicTradition[] = [
  'PARASHARA',
  'JAIMINI',
  'VARAHAMIHIRA',
  'MANTRESWARA',
  'KALYANA_VARMA',
  'VAIDYANATHA',
  'VEDIC_CLASSICAL_GENERAL',
  'MODERN_VEDIC',
  'SPIRITUAL_HERMENEUTIC',
  'PANCHANG_TRADITION',
] as const

/**
 * Authenticity Tier for knowledge corpus items
 */
export type AuthenticityTier =
  | 'TIER_1_CANONICAL_CLASSICAL'   // Direct canonical classical Sanskrit text / shloka citation
  | 'TIER_2_COMMENTARY_HERMENEUTIC'// Recognized classical commentary & standard translations
  | 'TIER_3_MODERN_SYNTHESIS'      // Peer-reviewed or verified contemporary practitioner research
  | 'TIER_4_HEURISTIC_EXPLORATORY' // Dynamic heuristic / internal interpretive synthesis

export const AUTHENTICITY_TIERS: readonly AuthenticityTier[] = [
  'TIER_1_CANONICAL_CLASSICAL',
  'TIER_2_COMMENTARY_HERMENEUTIC',
  'TIER_3_MODERN_SYNTHESIS',
  'TIER_4_HEURISTIC_EXPLORATORY',
] as const

/**
 * Quality rating of astrological assertion or factual backing
 */
export type ProvenanceTruthQuality =
  | 'approximate'
  | 'heuristic'
  | 'verified'
  | 'authoritative'

export const PROVENANCE_TRUTH_QUALITIES: readonly ProvenanceTruthQuality[] = [
  'approximate',
  'heuristic',
  'verified',
  'authoritative',
] as const

/**
 * Verification state of citation and textual alignment
 */
export type ProvenanceVerificationStatus = 'VERIFIED' | 'UNVALIDATED'

/**
 * Detailed provenance metadata tracking classical source, chapter, verse, and licensing
 */
export interface CorpusProvenance {
  /** Unique identifier for the source text or manuscript */
  sourceId: string
  /** Astrological / spiritual tradition */
  tradition: VedicTradition
  /** Formal title of the source work (e.g., 'Brihat Parashara Hora Shastra') */
  sourceTitle: string
  /** Original author or compiler (e.g., 'Maharishi Parashara') */
  author?: string
  /** Chapter number or title (e.g., 'Adhyaya 12: Bhava Phala') */
  chapter?: string | number
  /** Verse range or shloka index (e.g., 'Verses 14-16') */
  verseRange?: string
  /** Devanagari or IAST Sanskrit shloka text if available */
  shlokaSanskrit?: string
  /** Standard scholarly English translation */
  translationEnglish?: string
  /** Scholarly commentary or hermeneutic note */
  commentary?: string
  /** Authenticity classification tier */
  authenticityTier: AuthenticityTier
  /** Truth quality level */
  truthQuality: ProvenanceTruthQuality
  /** Verification status against authoritative manuscripts */
  verificationStatus: ProvenanceVerificationStatus
  /** License, attribution, or public-domain citation statement */
  licenseOrAttribution: string
}

/**
 * Raw document submitted for ingestion into Guru Knowledge Base
 */
export interface CorpusDocument {
  id: string
  title: string
  content: string
  mode: GuruRagMode
  category: string
  tags: string[]
  provenance: CorpusProvenance
  createdAt?: string
  updatedAt?: string
}

/**
 * Processed chunk with cryptographic hash and enriched provenance
 */
export interface CorpusChunk {
  /** Unique chunk ID (e.g. docId_chunk0_hashPrefix) */
  id: string
  /** Parent document identifier */
  documentId: string
  /** Sequential index within parent document */
  chunkIndex: number
  /** Chunk text content */
  text: string
  /** SHA-256 hash of normalized text for deduplication and provenance integrity */
  contentHash: string
  /** Primary Guru RAG mode */
  mode: GuruRagMode
  /** Category categorization */
  category: string
  /** Associated semantic tags */
  tags: string[]
  /** Deep provenance metadata */
  provenance: CorpusProvenance
  /** Estimated token count */
  tokenCountEstimate: number
  /** Byte size of UTF-8 content */
  byteSize: number
  /** Ingestion / creation timestamp */
  createdAt: string
}

/**
 * Intermediate candidate during hybrid retrieval
 */
export interface RetrievalCandidate {
  chunk: CorpusChunk
  /** Vector similarity score in range [0, 1] if available */
  semanticScore?: number
  /** Lexical / BM25 keyword score in range [0, 1] if available */
  lexicalScore?: number
  /** Combined fused score */
  combinedScore?: number
  /** Rank positions across different search modalities */
  ranks: {
    semanticRank?: number
    lexicalRank?: number
    rrfRank?: number
  }
  /** Multiplier applied based on authenticity tier and mode */
  provenanceBoost?: number
}

/**
 * Output of hybrid retrieval and Reciprocal Rank Fusion reranking
 */
export interface RerankedResult {
  /** Top ranked chunks after fusion and tier boosting */
  chunks: CorpusChunk[]
  /** Normalized scores in range [0, 1] corresponding to chunks */
  scores: number[]
  /** Full candidate evaluation details */
  candidates: RetrievalCandidate[]
  /** Retrieval execution summary */
  metrics: {
    totalCandidates: number
    semanticMatches: number
    lexicalMatches: number
    fusedMatches: number
    rerankTimeMs: number
  }
  /** Whether search operated in a degraded fallback state */
  degraded: boolean
}

/**
 * Query parameters for hybrid retrieval
 */
export interface HybridQueryParams {
  query: string
  mode?: GuruRagMode
  astroContextSummary?: string
  topK?: number
  minScore?: number
  traditionFilter?: VedicTradition[]
  tierFilter?: AuthenticityTier[]
  filter?: Record<string, any>
  signal?: AbortSignal
}

/**
 * Options for RRF fusion and reranking
 */
export interface RerankerOptions {
  /** Reciprocal Rank Fusion smoothing constant (default: 60) */
  k?: number
  /** Weight assigned to semantic vector rank (default: 0.6) */
  semanticWeight?: number
  /** Weight assigned to lexical keyword rank (default: 0.4) */
  lexicalWeight?: number
  /** Multiplier for Tier 1 Canonical Classical texts (default: 1.25) */
  tier1Boost?: number
  /** Multiplier for Tier 2 Commentary texts (default: 1.10) */
  tier2Boost?: number
  /** Multiplier for exact Guru mode match (default: 1.15) */
  modeMatchBoost?: number
  /** Minimum final score required to be included in output (default: 0.01) */
  minScoreThreshold?: number
}

/**
 * RAG Grounding & Evaluation Metrics
 */
export interface RagEvaluationMetrics {
  /** Proportion of assertions grounded in retrieved context (0 to 1) */
  faithfulness: number
  /** Query-response intent alignment score (0 to 1) */
  answerRelevance: number
  /** Proportion of golden reference facts retrieved in context (0 to 1) */
  contextRecall: number
  /** Rank precision of relevant documents (Mean Reciprocal Rank / P@K) */
  contextPrecision: number
  /** Compliance with JyotiAI non-fatalistic safety policies */
  astrologySafetyCompliant: boolean
  /** Any safety violations or policy warnings triggered */
  safetyFlags: string[]
  /** Composite quality index (0 to 1) */
  overallScore: number
}

/**
 * Parameters for evaluating a single Guru interaction turn
 */
export interface TurnEvaluationParams {
  query: string
  answer: string
  retrievedChunks: CorpusChunk[]
  expectedFacts?: string[]
  relevantChunkIds?: string[]
}

/**
 * Evaluation test case for golden dataset benchmarks
 */
export interface RagEvaluationTestCase {
  id: string
  name: string
  query: string
  mode: GuruRagMode
  expectedRelevantSources?: string[]
  expectedKeyConcepts: string[]
  expectedSafetyCompliant: boolean
  mockGeneratedAnswer?: string
}

/**
 * Summary of a benchmark evaluation run
 */
export interface EvaluationBenchmarkReport {
  suiteName: string
  timestamp: string
  totalCases: number
  passedCases: number
  averageFaithfulness: number
  averageRelevance: number
  averageRecall: number
  safetyComplianceRate: number
  passed: boolean
  details: Array<{
    caseId: string
    name: string
    metrics: RagEvaluationMetrics
    passed: boolean
  }>
}

/**
 * Jyoti Core Service health and status descriptor
 */
export interface JyotiCoreServiceHealth {
  service: 'JyotiGuruRAGCore'
  version: string
  status: 'healthy' | 'degraded' | 'uninitialized'
  vectorBackendAvailable: boolean
  lexicalBackendAvailable: boolean
  rerankerAvailable: boolean
  totalIndexedDocuments: number
  totalIndexedChunks: number
}
