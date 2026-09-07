/**
 * Jyoti Core Services / Guru RAG Core Consolidation
 * 
 * Part of P1-003: Guru / RAG Core Consolidation
 * 
 * Consolidates the Guru Brain orchestration, hybrid retrieval, RRF reranking,
 * provenance validation, and quality evaluation into a pure, native TypeScript
 * service architecture. Replaces legacy external Python-brain service plans
 * with high-performance, deterministic, and type-safe server-side execution.
 */

import { evaluateTurn } from './evaluation'
import {
  createChunksFromDocument,
  deduplicateChunks,
  validateCorpusDocument,
} from './ingestion'
import {
  CorpusIndexStore,
  defaultIndexStore,
  executeHybridRetrieval,
} from './retrieval'
import type {
  CorpusChunk,
  CorpusDocument,
  HybridQueryParams,
  JyotiCoreServiceHealth,
  RagEvaluationMetrics,
  RerankedResult,
  TurnEvaluationParams,
} from './types'

/**
 * Result of ingesting a document into Jyoti Core
 */
export interface IngestDocumentResult {
  documentId: string
  chunksCreated: number
  uniqueChunksAdded: number
  duplicatesSkipped: number
  contentHashes: string[]
  success: boolean
}

/**
 * Summary report of corpus validation
 */
export interface CorpusValidationReport {
  totalDocuments: number
  validDocuments: number
  invalidDocuments: number
  totalChunks: number
  tierDistribution: Record<string, number>
  traditionDistribution: Record<string, number>
  errors: Array<{ documentId: string; errors: string[] }>
  warnings: Array<{ documentId: string; warnings: string[] }>
}

/**
 * Enhanced query response from Jyoti Core Service
 */
export interface CoreQueryResult extends RerankedResult {
  query: string
  mode: string
  formattedContextBlock: string
  citationSummary: string[]
}

/**
 * Canonical Jyoti Core Service
 */
export class JyotiGuruCoreService {
  private indexStore: CorpusIndexStore
  private documentRegistry: Map<string, CorpusDocument> = new Map()
  private isInitialized = true

  constructor(indexStore: CorpusIndexStore = defaultIndexStore) {
    this.indexStore = indexStore
  }

  /**
   * Ingests a verified CorpusDocument into the unified index
   */
  public ingestDocument(doc: CorpusDocument): IngestDocumentResult {
    const validation = validateCorpusDocument(doc)
    if (!validation.valid) {
      throw new Error(`Document validation failed: ${validation.errors.join('; ')}`)
    }

    const chunks = createChunksFromDocument(doc)
    const { uniqueChunks, duplicatesCount } = deduplicateChunks(chunks)

    this.indexStore.addChunks(uniqueChunks)
    this.documentRegistry.set(doc.id, doc)

    return {
      documentId: doc.id,
      chunksCreated: chunks.length,
      uniqueChunksAdded: uniqueChunks.length,
      duplicatesSkipped: duplicatesCount,
      contentHashes: uniqueChunks.map((c) => c.contentHash),
      success: true,
    }
  }

  /**
   * Batch validates a collection of documents without indexing
   */
  public validateCorpus(docs: unknown[]): CorpusValidationReport {
    let validDocs = 0
    let invalidDocs = 0
    let totalChunks = 0
    const tierDist: Record<string, number> = {}
    const traditionDist: Record<string, number> = {}
    const errors: Array<{ documentId: string; errors: string[] }> = []
    const warnings: Array<{ documentId: string; warnings: string[] }> = []

    for (const raw of docs) {
      const doc = raw as Record<string, any>
      const docId = doc?.id || 'unknown_doc'
      const validation = validateCorpusDocument(doc)

      if (validation.valid) {
        validDocs++
        const tier = doc.provenance?.authenticityTier || 'UNKNOWN'
        const tradition = doc.provenance?.tradition || 'UNKNOWN'

        tierDist[tier] = (tierDist[tier] || 0) + 1
        traditionDist[tradition] = (traditionDist[tradition] || 0) + 1

        try {
          const chunks = createChunksFromDocument(doc as CorpusDocument)
          totalChunks += chunks.length
        } catch {
          // Ignore chunk estimate failures in preview
        }
      } else {
        invalidDocs++
        errors.push({ documentId: docId, errors: validation.errors })
      }

      if (validation.warnings.length > 0) {
        warnings.push({ documentId: docId, warnings: validation.warnings })
      }
    }

    return {
      totalDocuments: docs.length,
      validDocuments: validDocs,
      invalidDocuments: invalidDocs,
      totalChunks,
      tierDistribution: tierDist,
      traditionDistribution: traditionDist,
      errors,
      warnings,
    }
  }

  /**
   * Queries the hybrid retrieval engine with RRF reranking and context synthesis
   */
  public async query(params: HybridQueryParams): Promise<CoreQueryResult> {
    const retrievalResult = await executeHybridRetrieval(params, this.indexStore)

    // Synthesize citations and formatted context block for LLM prompting
    const citationSummary: string[] = []
    const contextLines: string[] = []

    for (let i = 0; i < retrievalResult.chunks.length; i++) {
      const chunk = retrievalResult.chunks[i]
      const score = retrievalResult.scores[i] || 0
      const prov = chunk.provenance

      const citation = `[Source: ${prov.sourceTitle}, ${prov.chapter ? `${prov.chapter}, ` : ''}${prov.verseRange || ''} (${prov.tradition}, ${prov.authenticityTier})]`
      citationSummary.push(citation)

      contextLines.push(
        `--- Reference Excerpt #${i + 1} (Score: ${score.toFixed(2)}) ---\n${citation}\n${chunk.text}`
      )
    }

    const formattedContextBlock = contextLines.join('\n\n')

    return {
      ...retrievalResult,
      query: params.query,
      mode: params.mode || 'general',
      formattedContextBlock,
      citationSummary,
    }
  }

  /**
   * Evaluates an interaction turn for grounding faithfulness and safety
   */
  public evaluateTurn(params: TurnEvaluationParams): RagEvaluationMetrics {
    return evaluateTurn(params)
  }

  /**
   * Returns current service health and metrics
   */
  public getHealth(): JyotiCoreServiceHealth {
    return {
      service: 'JyotiGuruRAGCore',
      version: '1.0.0-consolidated',
      status: this.isInitialized ? 'healthy' : 'degraded',
      vectorBackendAvailable: process.env.GURU_RAG_ENABLED !== 'false',
      lexicalBackendAvailable: true,
      rerankerAvailable: true,
      totalIndexedDocuments: this.documentRegistry.size,
      totalIndexedChunks: this.indexStore.size(),
    }
  }
}

/**
 * Global singleton instance of the consolidated Jyoti Guru Core Service
 */
let coreServiceInstance: JyotiGuruCoreService | null = null

export function getJyotiCoreService(): JyotiGuruCoreService {
  if (!coreServiceInstance) {
    coreServiceInstance = new JyotiGuruCoreService(defaultIndexStore)
  }
  return coreServiceInstance
}
