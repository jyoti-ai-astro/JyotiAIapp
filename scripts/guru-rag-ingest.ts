/**
 * Guru RAG Ingestion Script
 * 
 * Super Phase C - Global RAG Engine (Pinecone)
 * 
 * Ingests knowledge documents into Pinecone for Guru Brain
 * 
 * Usage:
 *   ts-node scripts/guru-rag-ingest.ts [source-dir]
 * 
 * Default source directory: rag_sources/guru/
 */

import { readdir, readFile } from 'fs/promises'
import { join, extname } from 'path'
import { generateEmbedding } from '../lib/rag/embeddings'
import { upsertEmbeddings } from '../lib/rag/pinecone-client'

const DEFAULT_SOURCE_DIR = join(process.cwd(), 'rag_sources', 'guru')
const CHUNK_SIZE_TOKENS = 600 // ~500-800 tokens (roughly 2400-3200 chars)
const CHUNK_OVERLAP = 100 // Overlap between chunks

interface Chunk {
  id: string
  text: string
  metadata: {
    mode: string
    source: string
    chunkIndex: number
    type: 'guru'
  }
}

/**
 * Split text into chunks
 */
function chunkText(text: string, source: string, mode: string): Chunk[] {
  const chunks: Chunk[] = []
  const words = text.split(/\s+/)
  const wordsPerChunk = CHUNK_SIZE_TOKENS
  const overlapWords = CHUNK_OVERLAP

  for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
    const chunkWords = words.slice(i, i + wordsPerChunk)
    const chunkText = chunkWords.join(' ')

    if (chunkText.trim().length > 0) {
      chunks.push({
        id: `${source}_${i}_${Date.now()}`,
        text: chunkText,
        metadata: {
          mode,
          source,
          chunkIndex: chunks.length,
          type: 'guru',
        },
      })
    }
  }

  return chunks
}

/**
 * Detect mode from filename or content
 */
function detectMode(filename: string, content: string): string {
  const lowerFilename = filename.toLowerCase()
  const lowerContent = content.toLowerCase()

  if (lowerFilename.includes('career') || lowerContent.includes('career')) return 'career'
  if (lowerFilename.includes('relationship') || lowerContent.includes('relationship') || lowerContent.includes('love')) return 'relationship'
  if (lowerFilename.includes('health') || lowerContent.includes('health')) return 'health'
  if (lowerFilename.includes('finance') || lowerContent.includes('money') || lowerContent.includes('finance')) return 'finance'
  if (lowerFilename.includes('remedy') || lowerContent.includes('remedy') || lowerContent.includes('mantra')) return 'remedy'
  if (lowerFilename.includes('nakshatra') || lowerContent.includes('nakshatra')) return 'nakshatra'
  if (lowerFilename.includes('dasha') || lowerContent.includes('dasha')) return 'dasha'
  if (lowerFilename.includes('compatibility') || lowerContent.includes('compatibility')) return 'compatibility'

  return 'general'
}

/**
 * Process a single file
 */
async function processFile(filePath: string, mode?: string): Promise<Chunk[]> {
  const ext = extname(filePath).toLowerCase()
  const filename = filePath.split(/[/\\]/).pop() || 'unknown'

  let content = ''

  if (ext === '.md' || ext === '.txt') {
    content = await readFile(filePath, 'utf-8')
  } else if (ext === '.json') {
    const json = JSON.parse(await readFile(filePath, 'utf-8'))
    content = json.content || json.text || JSON.stringify(json, null, 2)
  } else {
    console.warn(`Skipping unsupported file: ${filePath}`)
    return []
  }

  const detectedMode = mode || detectMode(filename, content)
  const chunks = chunkText(content, filename, detectedMode)

  console.log(`  Processed ${filename}: ${chunks.length} chunks, mode: ${detectedMode}`)

  return chunks
}

/**
 * Main ingestion function
 */
async function ingest(sourceDir: string = DEFAULT_SOURCE_DIR) {
  console.log(`🚀 Starting Guru RAG ingestion from: ${sourceDir}`)

  try {
    // Read all files from source directory
    const files = await readdir(sourceDir, { withFileTypes: true })
    const filePaths: string[] = []

    for (const file of files) {
      if (file.isFile()) {
        const ext = extname(file.name).toLowerCase()
        if (['.md', '.txt', '.json'].includes(ext)) {
          filePaths.push(join(sourceDir, file.name))
        }
      }
    }

    if (filePaths.length === 0) {
      console.warn(`⚠️  No supported files found in ${sourceDir}`)
      console.log('   Supported formats: .md, .txt, .json')
      return
    }

    console.log(`📚 Found ${filePaths.length} files to process\n`)

    // Process all files
    const allChunks: Chunk[] = []
    for (const filePath of filePaths) {
      try {
        const chunks = await processFile(filePath)
        allChunks.push(...chunks)
      } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error)
      }
    }

    if (allChunks.length === 0) {
      console.warn('⚠️  No chunks generated')
      return
    }

    console.log(`\n📦 Generated ${allChunks.length} chunks total`)
    console.log('🔄 Generating embeddings and uploading to Pinecone...\n')

    // Generate embeddings and upload in batches
    const BATCH_SIZE = 10
    let uploaded = 0

    for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
      const batch = allChunks.slice(i, i + BATCH_SIZE)
      
      try {
        // Generate embeddings for batch
        const embeddings = await Promise.all(
          batch.map((chunk) => generateEmbedding(chunk.text))
        )

        // Prepare vectors for Pinecone
        const vectors = batch.map((chunk, idx) => ({
          id: chunk.id,
          values: embeddings[idx],
          metadata: {
            ...chunk.metadata,
            content: chunk.text.substring(0, 500), // Store first 500 chars in metadata
            title: chunk.metadata.source.replace(/\.[^/.]+$/, ''), // Remove extension
          },
        }))

        // Upload to Pinecone
        await upsertEmbeddings(vectors)
        uploaded += batch.length

        console.log(`  ✅ Uploaded batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} chunks (${uploaded}/${allChunks.length})`)
      } catch (error) {
        console.error(`❌ Error uploading batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error)
      }
    }

    console.log(`\n✨ Ingestion complete! Uploaded ${uploaded}/${allChunks.length} chunks to Pinecone`)
  } catch (error) {
    console.error('❌ Ingestion failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  const sourceDir = process.argv[2] || DEFAULT_SOURCE_DIR
  ingest(sourceDir).catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { ingest }

