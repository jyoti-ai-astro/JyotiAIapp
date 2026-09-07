/**
 * Ingestion Architecture & Deterministic Chunking
 * 
 * Part of P1-003: Guru / RAG Core Consolidation
 * 
 * Provides:
 * - Semantic boundary-preserving text chunker for Vedic and commentary texts
 * - Deterministic SHA-256 content hashing for deduplication and audit trails
 * - Document schema and provenance validation
 * - Ingestion pipeline producing verified CorpusChunks
 */

import { createHash } from 'node:crypto'
import type { GuruRagMode } from '../index'
import { validateProvenance } from './provenance'
import type {
  CorpusChunk,
  CorpusDocument,
  CorpusProvenance,
} from './types'

/**
 * Valid Guru RAG Modes
 */
export const VALID_GURU_RAG_MODES: readonly GuruRagMode[] = [
  'general',
  'career',
  'relationship',
  'health',
  'finance',
  'remedy',
  'nakshatra',
  'dasha',
  'compatibility',
] as const

/**
 * Options for text chunking
 */
export interface ChunkingOptions {
  /** Approximate word/token limit per chunk (default: 450) */
  chunkSizeTokens?: number
  /** Overlap between consecutive chunks in tokens (default: 60) */
  overlapTokens?: number
  /** Minimum characters to consider a chunk valid (default: 40) */
  minChunkChars?: number
}

/**
 * Validation result for an ingested document
 */
export interface DocumentValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Computes deterministic SHA-256 hex digest for normalized text
 */
export function computeContentHash(text: string): string {
  const normalized = text
    .normalize('NFKC')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
  return createHash('sha256').update(normalized, 'utf8').digest('hex')
}

/**
 * Rough token count estimation (1 token ≈ 4 characters or ~0.75 words)
 */
export function estimateTokenCount(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  return Math.max(1, Math.round(words.length * 1.3))
}

/**
 * Splits text on semantic boundaries (paragraphs, verse/shloka ends, periods)
 * avoiding mid-sentence or mid-shloka cuts.
 */
export function splitIntoSemanticBlocks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  // Split on double newlines (paragraphs) or shloka terminators (|| or ॥)
  const rawBlocks = normalized.split(/(?:\n\s*\n|॥|\|\|)/g)
  const blocks: string[] = []

  for (const block of rawBlocks) {
    const trimmed = block.trim()
    if (trimmed.length > 0) {
      blocks.push(trimmed)
    }
  }

  return blocks
}

/**
 * Chunks text preserving semantic integrity, token boundaries, and overlap.
 */
export function chunkTextSemantically(
  text: string,
  options?: ChunkingOptions
): string[] {
  const chunkSizeTokens = options?.chunkSizeTokens ?? 450
  const overlapTokens = options?.overlapTokens ?? 60
  const minChunkChars = options?.minChunkChars ?? 40

  const blocks = splitIntoSemanticBlocks(text)
  if (blocks.length === 0) return []

  const chunks: string[] = []
  let currentChunkWords: string[] = []

  for (const block of blocks) {
    const blockWords = block.split(/\s+/).filter(Boolean)
    const projectedLength = Math.round((currentChunkWords.length + blockWords.length) * 1.3)

    if (projectedLength > chunkSizeTokens && currentChunkWords.length > 0) {
      // Finalize current chunk
      const chunkString = currentChunkWords.join(' ')
      if (chunkString.length >= minChunkChars) {
        chunks.push(chunkString)
      }

      // Preserve overlap words from end of current chunk
      const overlapWordsCount = Math.min(
        currentChunkWords.length,
        Math.round(overlapTokens / 1.3)
      )
      const overlap = currentChunkWords.slice(-overlapWordsCount)
      currentChunkWords = [...overlap, ...blockWords]
    } else {
      currentChunkWords.push(...blockWords)
    }
  }

  if (currentChunkWords.length > 0) {
    const finalChunk = currentChunkWords.join(' ')
    if (finalChunk.length >= minChunkChars) {
      chunks.push(finalChunk)
    }
  }

  return chunks.length > 0 ? chunks : [text.trim()]
}

/**
 * Validates a CorpusDocument for completeness and integrity
 */
export function validateCorpusDocument(doc: unknown): DocumentValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!doc || typeof doc !== 'object') {
    return {
      valid: false,
      errors: ['CorpusDocument must be a non-null object'],
      warnings: [],
    }
  }

  const d = doc as Record<string, any>

  if (!d.id || typeof d.id !== 'string' || d.id.trim().length === 0) {
    errors.push('Document id is required and must be non-empty')
  }

  if (!d.title || typeof d.title !== 'string' || d.title.trim().length === 0) {
    errors.push('Document title is required and must be non-empty')
  }

  if (!d.content || typeof d.content !== 'string' || d.content.trim().length < 20) {
    errors.push('Document content must be at least 20 characters')
  }

  if (!d.mode || !VALID_GURU_RAG_MODES.includes(d.mode)) {
    errors.push(`Document mode must be one of: ${VALID_GURU_RAG_MODES.join(', ')}`)
  }

  if (!d.category || typeof d.category !== 'string') {
    errors.push('Document category is required')
  }

  if (!Array.isArray(d.tags)) {
    errors.push('Document tags must be an array of strings')
  }

  // Validate embedded provenance
  if (!d.provenance) {
    errors.push('Document provenance is mandatory for corpus integrity')
  } else {
    const provValidation = validateProvenance(d.provenance)
    if (!provValidation.valid) {
      errors.push(...provValidation.errors.map((e) => `Provenance error: ${e}`))
    }
    warnings.push(...provValidation.warnings)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Processes a verified CorpusDocument into deterministic CorpusChunks
 */
export function createChunksFromDocument(
  doc: CorpusDocument,
  options?: ChunkingOptions
): CorpusChunk[] {
  const validation = validateCorpusDocument(doc)
  if (!validation.valid) {
    throw new Error(`Cannot chunk invalid CorpusDocument: ${validation.errors.join('; ')}`)
  }

  const textChunks = chunkTextSemantically(doc.content, options)
  const now = new Date().toISOString()

  return textChunks.map((chunkText, index) => {
    const hash = computeContentHash(chunkText)
    const hashPrefix = hash.substring(0, 10)
    const chunkId = `${doc.id}_chunk${index}_${hashPrefix}`

    return {
      id: chunkId,
      documentId: doc.id,
      chunkIndex: index,
      text: chunkText,
      contentHash: hash,
      mode: doc.mode,
      category: doc.category,
      tags: [...doc.tags],
      provenance: { ...doc.provenance },
      tokenCountEstimate: estimateTokenCount(chunkText),
      byteSize: Buffer.byteLength(chunkText, 'utf8'),
      createdAt: now,
    }
  })
}

/**
 * Deduplicates a list of CorpusChunks based on contentHash and ID
 */
export function deduplicateChunks(chunks: CorpusChunk[]): {
  uniqueChunks: CorpusChunk[]
  duplicatesCount: number
} {
  const seenHashes = new Set<string>()
  const unique: CorpusChunk[] = []
  let duplicates = 0

  for (const chunk of chunks) {
    if (seenHashes.has(chunk.contentHash)) {
      duplicates++
    } else {
      seenHashes.add(chunk.contentHash)
      unique.push(chunk)
    }
  }

  return {
    uniqueChunks: unique,
    duplicatesCount: duplicates,
  }
}
