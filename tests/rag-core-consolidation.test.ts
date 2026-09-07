import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  AUTHENTICITY_TIER_WEIGHTS,
  AUTHENTICITY_TIERS,
  computeContentHash,
  computeLexicalScore,
  computeRrfComponent,
  CorpusIndexStore,
  createChunksFromDocument,
  createCorpusProvenance,
  deduplicateChunks,
  DEFAULT_RERANKER_OPTIONS,
  evaluateAstrologySafety,
  evaluateFaithfulness,
  evaluateTurn,
  executeHybridRetrieval,
  fuseRanks,
  getAuthenticityTierWeight,
  JyotiGuruCoreService,
  PROVENANCE_TRUTH_QUALITIES,
  rerankCandidates,
  runEvaluationBenchmark,
  splitIntoSemanticBlocks,
  tokenizeQuery,
  TRADITION_CANONICAL_INFO,
  validateCorpusDocument,
  validateProvenance,
  VEDIC_TRADITIONS,
  type CorpusDocument,
  type CorpusProvenance,
  type RetrievalCandidate,
} from '../lib/rag/core'

function testVedicTraditionsAndAuthenticityTiers() {
  assert.equal(VEDIC_TRADITIONS.length, 10)
  assert.ok(VEDIC_TRADITIONS.includes('PARASHARA'))
  assert.ok(VEDIC_TRADITIONS.includes('JAIMINI'))
  assert.ok(VEDIC_TRADITIONS.includes('VARAHAMIHIRA'))
  assert.ok(VEDIC_TRADITIONS.includes('MANTRESWARA'))

  assert.equal(AUTHENTICITY_TIERS.length, 4)
  assert.ok(AUTHENTICITY_TIERS.includes('TIER_1_CANONICAL_CLASSICAL'))
  assert.ok(AUTHENTICITY_TIERS.includes('TIER_2_COMMENTARY_HERMENEUTIC'))
  assert.ok(AUTHENTICITY_TIERS.includes('TIER_3_MODERN_SYNTHESIS'))
  assert.ok(AUTHENTICITY_TIERS.includes('TIER_4_HEURISTIC_EXPLORATORY'))

  // Verify tier weights ordering
  assert.ok(AUTHENTICITY_TIER_WEIGHTS.TIER_1_CANONICAL_CLASSICAL > AUTHENTICITY_TIER_WEIGHTS.TIER_2_COMMENTARY_HERMENEUTIC)
  assert.ok(AUTHENTICITY_TIER_WEIGHTS.TIER_2_COMMENTARY_HERMENEUTIC > AUTHENTICITY_TIER_WEIGHTS.TIER_3_MODERN_SYNTHESIS)
  assert.ok(AUTHENTICITY_TIER_WEIGHTS.TIER_3_MODERN_SYNTHESIS > AUTHENTICITY_TIER_WEIGHTS.TIER_4_HEURISTIC_EXPLORATORY)

  // Verify canonical tradition information exists for Parashara and Mantreswara
  assert.equal(TRADITION_CANONICAL_INFO.PARASHARA.primaryAuthor, 'Maharishi Parashara')
  assert.equal(TRADITION_CANONICAL_INFO.MANTRESWARA.primaryText, 'Phaladeepika')
}

function testProvenanceValidationAndCreation() {
  // Valid Tier 1 provenance
  const validProvInput = {
    sourceId: 'BPHS-TEST-01',
    tradition: 'PARASHARA' as const,
    sourceTitle: 'Brihat Parashara Hora Shastra',
    authenticityTier: 'TIER_1_CANONICAL_CLASSICAL' as const,
    author: 'Maharishi Parashara',
    chapter: 12,
    verseRange: '1-4',
    shlokaSanskrit: 'जीवात् ज्ञानं सुखं बुद्धिः',
    translationEnglish: 'From Jupiter arises wisdom, happiness and intellect.',
    licenseOrAttribution: 'Public Domain Classical Shastra',
  }

  const prov = createCorpusProvenance(validProvInput)
  assert.equal(prov.sourceId, 'BPHS-TEST-01')
  assert.equal(prov.truthQuality, 'authoritative')
  assert.equal(prov.verificationStatus, 'VERIFIED')

  const validationResult = validateProvenance(prov)
  assert.equal(validationResult.valid, true)
  assert.equal(validationResult.errors.length, 0)

  // Invalid: missing sourceId
  const invalidResult1 = validateProvenance({
    ...validProvInput,
    sourceId: '',
  })
  assert.equal(invalidResult1.valid, false)
  assert.ok(invalidResult1.errors.some((e) => e.includes('sourceId is required')))

  // Invalid: Tier 1 classical without Sanskrit or English translation
  const invalidResult2 = validateProvenance({
    ...validProvInput,
    shlokaSanskrit: undefined,
    translationEnglish: undefined,
  })
  assert.equal(invalidResult2.valid, false)
  assert.ok(invalidResult2.errors.some((e) => e.includes('must include either Sanskrit shloka or English translation')))
}

function testDeterministicSemanticChunkingAndHashing() {
  const sampleText = `Surya is the soul of the cosmos. It represents consciousness and royal splendor.

Brihaspati represents supreme wisdom and dharmic insight. He guides the seeker towards righteousness.`

  const blocks = splitIntoSemanticBlocks(sampleText)
  assert.equal(blocks.length, 2)
  assert.ok(blocks[0].includes('Surya'))
  assert.ok(blocks[1].includes('Brihaspati'))

  // Hash determinism
  const hash1 = computeContentHash(sampleText)
  const hash2 = computeContentHash(sampleText)
  const hash3 = computeContentHash(sampleText.trim() + '   ')
  assert.equal(hash1, hash2)
  assert.equal(hash1, hash3) // normalizes whitespace

  // Create valid document and chunk it
  const sampleDoc: CorpusDocument = {
    id: 'test_doc_001',
    title: 'Solar and Jovian Principles',
    content: sampleText,
    mode: 'general',
    category: 'graha_nature',
    tags: ['sun', 'jupiter', 'dharma'],
    provenance: createCorpusProvenance({
      sourceId: 'TEST-BPHS-01',
      tradition: 'PARASHARA',
      sourceTitle: 'Brihat Parashara Hora Shastra',
      authenticityTier: 'TIER_1_CANONICAL_CLASSICAL',
      shlokaSanskrit: 'सूर्य आत्मा जगतस्तस्थुषश्च',
      translationEnglish: 'The Sun is the soul of all moving and unmoving things.',
      licenseOrAttribution: 'Public Domain',
    }),
  }

  const chunks = createChunksFromDocument(sampleDoc, { chunkSizeTokens: 30 })
  assert.ok(chunks.length >= 1)
  assert.equal(chunks[0].documentId, 'test_doc_001')
  assert.ok(chunks[0].contentHash.length > 0)
  assert.ok(chunks[0].id.startsWith('test_doc_001_chunk0_'))

  // Deduplication
  const duplicatedList = [...chunks, ...chunks]
  const { uniqueChunks, duplicatesCount } = deduplicateChunks(duplicatedList)
  assert.equal(uniqueChunks.length, chunks.length)
  assert.equal(duplicatesCount, chunks.length)
}

function testReciprocalRankFusionAndReranker() {
  // Test individual RRF score
  const scoreRank1 = computeRrfComponent(1, 60, 1.0) // 1 / 61 ≈ 0.01639
  const scoreRank2 = computeRrfComponent(2, 60, 1.0) // 1 / 62 ≈ 0.01612
  assert.ok(scoreRank1 > scoreRank2)

  // Test rank fusion
  const semanticRanks = new Map<string, number>([
    ['chunk_A', 1],
    ['chunk_B', 2],
  ])
  const lexicalRanks = new Map<string, number>([
    ['chunk_A', 2],
    ['chunk_B', 1],
  ])

  const fused = fuseRanks(semanticRanks, lexicalRanks, ['chunk_A', 'chunk_B'], {
    k: 60,
    semanticWeight: 0.6,
    lexicalWeight: 0.4,
  })

  const scoreA = fused.get('chunk_A')?.rrfScore ?? 0
  const scoreB = fused.get('chunk_B')?.rrfScore ?? 0
  assert.ok(scoreA > scoreB)

  // Test full reranking with candidates
  const candidate1: RetrievalCandidate = {
    chunk: {
      id: 'c1',
      documentId: 'd1',
      chunkIndex: 0,
      text: 'Sun is vital life force in 10th house.',
      contentHash: 'hash1',
      mode: 'career',
      category: 'sun',
      tags: ['sun', 'career'],
      provenance: createCorpusProvenance({
        sourceId: 'BPHS-1',
        tradition: 'PARASHARA',
        sourceTitle: 'BPHS',
        authenticityTier: 'TIER_1_CANONICAL_CLASSICAL',
        shlokaSanskrit: 'दशमे सूर्यः',
        translationEnglish: 'Sun in tenth house.',
        licenseOrAttribution: 'Public Domain',
      }),
      tokenCountEstimate: 10,
      byteSize: 38,
      createdAt: new Date().toISOString(),
    },
    semanticScore: 0.90,
    lexicalScore: 0.85,
    ranks: {
      semanticRank: 1,
      lexicalRank: 1,
    },
  }

  const candidate2: RetrievalCandidate = {
    chunk: {
      id: 'c2',
      documentId: 'd2',
      chunkIndex: 0,
      text: 'General astrological musings without shastric citation.',
      contentHash: 'hash2',
      mode: 'relationship',
      category: 'general',
      tags: ['general'],
      provenance: createCorpusProvenance({
        sourceId: 'MODERN-1',
        tradition: 'MODERN_VEDIC',
        sourceTitle: 'Modern Article',
        authenticityTier: 'TIER_4_HEURISTIC_EXPLORATORY',
        licenseOrAttribution: 'CC-BY',
      }),
      tokenCountEstimate: 10,
      byteSize: 55,
      createdAt: new Date().toISOString(),
    },
    semanticScore: 0.85,
    lexicalScore: 0.80,
    ranks: {
      semanticRank: 2,
      lexicalRank: 2,
    },
  }

  const rerankResult = rerankCandidates([candidate1, candidate2], {
    targetMode: 'career',
    topK: 5,
  })

  assert.equal(rerankResult.chunks.length, 2)
  assert.equal(rerankResult.chunks[0].id, 'c1')
  assert.ok(rerankResult.scores[0] > rerankResult.scores[1])
}

async function testHybridRetrievalAndCorpusIndexStore() {
  const tokens = tokenizeQuery('What does Jupiter and Guru indicate for career and 10th house?')
  assert.ok(tokens.includes('jupiter'))
  assert.ok(tokens.includes('guru'))
  assert.ok(tokens.includes('career'))

  const store = new CorpusIndexStore()

  const doc1: CorpusDocument = {
    id: 'doc_career_guru',
    title: 'Brihaspati in Tenth House of Career',
    content: 'Jupiter placed in the tenth house confers noble counsel, high status, and righteous profession.',
    mode: 'career',
    category: 'karma_bhava',
    tags: ['jupiter', 'guru', 'career', '10th house'],
    provenance: createCorpusProvenance({
      sourceId: 'BPHS-CAR-10',
      tradition: 'PARASHARA',
      sourceTitle: 'Brihat Parashara Hora Shastra',
      authenticityTier: 'TIER_1_CANONICAL_CLASSICAL',
      shlokaSanskrit: 'दशमे गुरौ',
      translationEnglish: 'Jupiter in tenth house.',
      licenseOrAttribution: 'Public Domain',
    }),
  }

  const chunks = createChunksFromDocument(doc1)
  store.addChunks(chunks)

  assert.equal(store.getAllChunks().length, chunks.length)

  // Compute lexical score
  const lexicalScore = computeLexicalScore(tokens, chunks[0])
  assert.ok(lexicalScore > 0.4)

  // Execute hybrid retrieval
  const hybridResult = await executeHybridRetrieval(
    {
      query: 'Jupiter tenth house career',
      mode: 'career',
      topK: 3,
    },
    store
  )

  assert.equal(hybridResult.chunks.length, 1)
  assert.equal(hybridResult.chunks[0].documentId, 'doc_career_guru')
  assert.equal(hybridResult.metrics.totalCandidates, 1)
  assert.equal(hybridResult.degraded, false)
}

function testAstrologySafetyAndGroundingEvaluation() {
  // Test fatalistic death prediction violation
  const dangerousAnswer1 = 'According to your planetary positions, you will die in the next two years.'
  const safety1 = evaluateAstrologySafety(dangerousAnswer1)
  assert.equal(safety1.compliant, false)
  assert.ok(safety1.flags.includes('FATALISTIC_DEATH_PREDICTION'))

  // Test unauthorized medical guarantee violation
  const dangerousAnswer2 = 'You are diagnosed with cancer and have guaranteed cure if you stop taking your medicine.'
  const safety2 = evaluateAstrologySafety(dangerousAnswer2)
  assert.equal(safety2.compliant, false)
  assert.ok(safety2.flags.includes('UNAUTHORIZED_MEDICAL_CLAIM'))

  // Test unvalidated Swiss Ephemeris claim violation
  const dangerousAnswer3 = 'This reading uses swiss ephemeris certified calculation with sub-arcsecond accuracy.'
  const safety3 = evaluateAstrologySafety(dangerousAnswer3)
  assert.equal(safety3.compliant, false)
  assert.ok(safety3.flags.includes('UNVALIDATED_ASTRO_CLAIM'))

  // Test compliant, empowering answer
  const safeAnswer = 'The planetary transits suggest a time for reflection and spiritual guidance. Through meditation, righteous action, and cultivating inner strength, one navigates challenges with equanimity.'
  const safetySafe = evaluateAstrologySafety(safeAnswer)
  assert.equal(safetySafe.compliant, true)
  assert.equal(safetySafe.hasEmpowermentFraming, true)

  // Test faithfulness evaluation
  const contextChunk = 'Brihaspati confers wisdom, dharmic intellect, and devotion to sacred learning.'
  const faithfulAnswer = 'Brihaspati brings profound wisdom, dharmic intellect, and devotion to sacred learning.'
  const faith = evaluateFaithfulness(faithfulAnswer, [contextChunk])
  assert.ok(faith.score >= 0.7)

  // Turn evaluation
  const turnResult = evaluateTurn({
    query: 'What does Jupiter confer?',
    answer: faithfulAnswer,
    retrievedChunks: [
      {
        id: 'c_test',
        documentId: 'd_test',
        chunkIndex: 0,
        text: contextChunk,
        contentHash: 'hash',
        mode: 'general',
        category: 'guru',
        tags: [],
        provenance: createCorpusProvenance({
          sourceId: 'S-1',
          tradition: 'PARASHARA',
          sourceTitle: 'BPHS',
          authenticityTier: 'TIER_1_CANONICAL_CLASSICAL',
          shlokaSanskrit: 'जीवात् ज्ञानम्',
          translationEnglish: 'From Jupiter arises wisdom.',
          licenseOrAttribution: 'Public Domain',
        }),
        tokenCountEstimate: 10,
        byteSize: 80,
        createdAt: new Date().toISOString(),
      },
    ],
  })

  assert.ok(turnResult.faithfulness >= 0.7)
  assert.equal(turnResult.astrologySafetyCompliant, true)
}

async function testJyotiGuruCoreServiceFacade() {
  const service = new JyotiGuruCoreService()

  const doc: CorpusDocument = {
    id: 'facade_doc_01',
    title: 'Phaladeepika: Upachaya Houses',
    content: 'The 3rd, 6th, 10th, and 11th houses are known as Upachaya houses, signifying continuous growth through sustained effort.',
    mode: 'general',
    category: 'bhavas',
    tags: ['upachaya', 'houses', 'growth'],
    provenance: createCorpusProvenance({
      sourceId: 'PHALA-UPA-01',
      tradition: 'MANTRESWARA',
      sourceTitle: 'Phaladeepika',
      authenticityTier: 'TIER_1_CANONICAL_CLASSICAL',
      shlokaSanskrit: 'त्रिषडायदशमेषु',
      translationEnglish: 'In the 3rd, 6th, 11th and 10th houses.',
      licenseOrAttribution: 'Public Domain',
    }),
  }

  const ingestRes = service.ingestDocument(doc)
  assert.equal(ingestRes.success, true)
  assert.equal(ingestRes.documentId, 'facade_doc_01')
  assert.ok(ingestRes.chunksCreated >= 1)

  // Health check
  const health = service.getHealth()
  assert.equal(health.status, 'healthy')
  assert.equal(health.totalIndexedDocuments, 1)
  assert.ok(health.totalIndexedChunks >= 1)

  // Validation report
  const report = service.validateCorpus([doc])
  assert.equal(report.validDocuments, 1)
  assert.equal(report.invalidDocuments, 0)
  assert.equal(report.tierDistribution['TIER_1_CANONICAL_CLASSICAL'], 1)
  assert.equal(report.traditionDistribution['MANTRESWARA'], 1)

  // Query service
  const queryRes = await service.query({
    query: 'Upachaya houses of growth',
    mode: 'general',
    topK: 2,
  })

  assert.equal(queryRes.query, 'Upachaya houses of growth')
  assert.ok(queryRes.chunks.length >= 1)
  assert.ok(queryRes.formattedContextBlock.includes('Phaladeepika'))
}

function testGoldenCorpusSchemaAndIntegrity() {
  const corpusPath = resolve(__dirname, '../lib/rag/data/golden-corpus.json')
  const schemaPath = resolve(__dirname, '../lib/rag/data/corpus-document.schema.json')

  const corpusRaw = readFileSync(corpusPath, 'utf8')
  const schemaRaw = readFileSync(schemaPath, 'utf8')

  const corpus: CorpusDocument[] = JSON.parse(corpusRaw)
  const schema = JSON.parse(schemaRaw)

  assert.ok(Array.isArray(corpus))
  assert.equal(corpus.length, 3)
  assert.equal(schema.title, 'Guru RAG Corpus Document Schema')

  // Validate every document in the golden corpus
  for (const doc of corpus) {
    const valResult = validateCorpusDocument(doc)
    assert.equal(
      valResult.valid,
      true,
      `Document ${doc.id} failed validation: ${valResult.errors.join(', ')}`
    )
    assert.equal(doc.provenance.authenticityTier, 'TIER_1_CANONICAL_CLASSICAL')
    assert.equal(doc.provenance.truthQuality, 'authoritative')
    assert.equal(doc.provenance.verificationStatus, 'VERIFIED')
    assert.ok(doc.provenance.shlokaSanskrit && doc.provenance.shlokaSanskrit.length > 5)
    assert.ok(doc.provenance.translationEnglish && doc.provenance.translationEnglish.length > 5)
  }
}

async function runAllTests() {
  console.log('Running JyotiAI Guru RAG Core Consolidation Tests (P1-003)...')

  testVedicTraditionsAndAuthenticityTiers()
  console.log('✔ Vedic traditions and authenticity tier weights verified')

  testProvenanceValidationAndCreation()
  console.log('✔ Provenance validation and Tier 1 invariant verification passed')

  testDeterministicSemanticChunkingAndHashing()
  console.log('✔ Semantic text chunking, SHA-256 hashing, and deduplication passed')

  testReciprocalRankFusionAndReranker()
  console.log('✔ Reciprocal Rank Fusion (RRF) and multi-factor reranking passed')

  await testHybridRetrievalAndCorpusIndexStore()
  console.log('✔ Hybrid lexical/semantic retrieval and CorpusIndexStore passed')

  testAstrologySafetyAndGroundingEvaluation()
  console.log('✔ Astrology safety policy, unvalidated claim rejection, and faithfulness passed')

  await testJyotiGuruCoreServiceFacade()
  console.log('✔ JyotiGuruCoreService facade, health checks, and formatted context passed')

  testGoldenCorpusSchemaAndIntegrity()
  console.log('✔ Golden corpus documents and schema integrity verified')

  console.log('\nAll P1-003 Guru RAG Core Consolidation tests passed successfully!')
}

runAllTests().catch((err) => {
  console.error('Test execution failed:', err)
  process.exit(1)
})
