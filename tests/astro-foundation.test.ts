import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  ASTRO_ACCURACY_CLASS,
  ASTRO_ENGINE_ID,
  ASTRO_VALIDATION_STATUS,
  createAstroFactsMetadata,
  isAstroFactsMetadata,
} from '../lib/engines/astro-facts'
import {
  attachKundaliAstroFacts,
  normalizeFirestoreKundaliData,
} from '../lib/engines/astro-context-builder'
import { generateFullKundali } from '../lib/engines/kundali/generator'
import type { BirthDetails } from '../lib/engines/kundali/swisseph-wrapper'
import type { KundaliData as LegacyKundaliData } from '../lib/engines/kundali-engine'
import type { AstroContext } from '../lib/engines/astro-types'

async function testGeneratedKundaliMetadata() {
  const birth: BirthDetails = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    second: 0,
    lat: 28.6139,
    lng: 77.209,
    timezone: 'Asia/Kolkata',
  }

  const kundali = await generateFullKundali(birth)

  assert.equal(kundali.meta.astroEngine.id, ASTRO_ENGINE_ID)
  assert.equal(kundali.meta.astroEngine.accuracyClass, ASTRO_ACCURACY_CLASS)
  assert.equal(kundali.meta.astroEngine.validationStatus, ASTRO_VALIDATION_STATUS)
  assert.equal(kundali.meta.astroEngine.usesSwissEphemeris, false)
  assert.equal(kundali.meta.astroEngine.claimsProductionPrecision, false)
  assert.equal(isAstroFactsMetadata(kundali.meta.astroFacts), true)
  assert.equal(kundali.meta.astroFacts.engineId, 'internal_approx_v1')
  assert.equal(kundali.meta.astroFacts.accuracyClass, 'APPROXIMATE')
  assert.equal(kundali.meta.astroFacts.validationStatus, 'UNVALIDATED')
  assert.equal(kundali.meta.houseSystem, 'whole-sign-approximation')
}

function testHistoricalKundaliShapeStillCompiles() {
  const historicalKundaliWithoutMetadata: LegacyKundaliData = {
    grahas: [],
    houses: [],
    lagna: {
      sign: 'Aries',
      longitude: 0,
    },
    dasha: {
      currentMahadasha: {
        planet: 'Jupiter',
        startDate: '2020-01-01T00:00:00.000Z',
        endDate: '2036-01-01T00:00:00.000Z',
      },
      currentAntardasha: {
        planet: 'Venus',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2025-01-01T00:00:00.000Z',
      },
    },
    divisionalCharts: {
      d1: null,
      d9: null,
      d10: null,
    },
  }

  const historicalMetadata = historicalKundaliWithoutMetadata.meta
  assert.equal(historicalMetadata, undefined)
  assert.equal(isAstroFactsMetadata(historicalMetadata), false)
}

function testReferenceDatasetSchemaOnly() {
  const schemaPath = resolve(__dirname, '../lib/engines/kundali/data/reference-dataset.schema.json')
  const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))

  assert.equal(schema.title, 'Kundali Reference Dataset Schema')
  assert.equal(schema.properties.schemaVersion.const, 'kundali_reference_dataset_v1')
  assert.equal(schema.examples, undefined)
  assert.equal(schema.default, undefined)
  assert.equal(schema.cases, undefined)
}

function testMetadataGuard() {
  const metadata = createAstroFactsMetadata()

  assert.equal(isAstroFactsMetadata(metadata), true)
  assert.equal(isAstroFactsMetadata(undefined), false)
  assert.equal(
    isAstroFactsMetadata({
      ...metadata,
      validationStatus: 'VALIDATED',
    }),
    false
  )
}

function createFirestoreD1Data() {
  return {
    grahas: {
      sun: {
        planet: 'Sun',
        sign: 'Aries',
        nakshatra: 'Ashwini',
        pada: 1,
        house: 1,
        longitude: 1,
        latitude: 0,
        degreesInSign: 1,
        retrograde: false,
      },
      moon: {
        planet: 'Moon',
        sign: 'Taurus',
        nakshatra: 'Rohini',
        pada: 2,
        house: 2,
        longitude: 31,
        latitude: 0,
        degreesInSign: 1,
        retrograde: false,
      },
    },
    bhavas: {
      1: {
        houseNumber: 1,
        sign: 'Aries',
        cuspLongitude: 0,
        planets: ['sun'],
      },
      2: {
        houseNumber: 2,
        sign: 'Taurus',
        cuspLongitude: 30,
        planets: ['moon'],
      },
    },
    lagna: {
      sign: 'Aries',
      longitude: 0,
    },
  }
}

function createFirestoreDashaData() {
  return {
    currentMahadasha: {
      planet: 'Jupiter',
      startDate: '2020-01-01T00:00:00.000Z',
      endDate: '2036-01-01T00:00:00.000Z',
    },
    currentAntardasha: {
      planet: 'Venus',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2025-01-01T00:00:00.000Z',
    },
  }
}

function createAstroContextFixture(): AstroContext {
  return {
    birthData: {
      dateOfBirth: '1990-01-01',
      timeOfBirth: '12:00',
      timezone: 'Asia/Kolkata',
      placeName: 'Delhi',
      latitude: 28.6139,
      longitude: 77.209,
    },
    coreChart: {
      houses: [],
      planets: [],
      ascendantSign: 'Aries',
      moonSign: 'Taurus',
      sunSign: 'Aries',
    },
    dasha: {
      currentMahadasha: {
        planet: 'Jupiter',
        startDate: '2020-01-01T00:00:00.000Z',
        endDate: '2036-01-01T00:00:00.000Z',
      },
      currentAntardasha: {
        planet: 'Venus',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2025-01-01T00:00:00.000Z',
      },
      next3Events: [],
    },
    timeline: [],
    personalityTags: [],
    riskFlags: [],
    cachedAt: '2026-09-06T00:00:00.000Z',
  }
}

function testFirestoreMetadataPropagationToAstroContext() {
  const astroFacts = createAstroFactsMetadata()
  const normalized = normalizeFirestoreKundaliData(
    {
      meta: {
        astroFacts,
      },
    },
    createFirestoreD1Data(),
    createFirestoreDashaData()
  )

  assert.notEqual(normalized, null)
  const normalizedAstroFacts = normalized?.meta?.astroFacts
  assert.notEqual(normalizedAstroFacts, undefined)
  assert.equal(normalizedAstroFacts?.engineId, ASTRO_ENGINE_ID)

  const context = attachKundaliAstroFacts(createAstroContextFixture(), normalized!)
  assert.equal(context.astroFacts?.engineId, ASTRO_ENGINE_ID)
  assert.equal(context.astroFacts?.accuracyClass, ASTRO_ACCURACY_CLASS)
  assert.equal(context.astroFacts?.validationStatus, ASTRO_VALIDATION_STATUS)
}

function testHistoricalFirestoreReadCompatibility() {
  const normalized = normalizeFirestoreKundaliData(
    { meta: { generatedAt: '2024-01-01T00:00:00.000Z' } },
    createFirestoreD1Data(),
    createFirestoreDashaData()
  )

  assert.notEqual(normalized, null)
  assert.equal(normalized?.meta, undefined)

  const context = attachKundaliAstroFacts(createAstroContextFixture(), normalized!)
  assert.equal(context.astroFacts, undefined)
}

async function main() {
  await testGeneratedKundaliMetadata()
  testHistoricalKundaliShapeStillCompiles()
  testReferenceDatasetSchemaOnly()
  testMetadataGuard()
  testFirestoreMetadataPropagationToAstroContext()
  testHistoricalFirestoreReadCompatibility()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
