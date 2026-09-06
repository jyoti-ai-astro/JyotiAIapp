export const ASTRO_ENGINE_ID = 'internal_approx_v1' as const
export const ASTRO_ACCURACY_CLASS = 'APPROXIMATE' as const
export const ASTRO_VALIDATION_STATUS = 'UNVALIDATED' as const
export const ASTRO_FACTS_SCHEMA_VERSION = 'astro_facts_v1' as const

export type AstroEngineId = typeof ASTRO_ENGINE_ID
export type AstroAccuracyClass = typeof ASTRO_ACCURACY_CLASS
export type AstroValidationStatus = typeof ASTRO_VALIDATION_STATUS
export type AstroFactsSchemaVersion = typeof ASTRO_FACTS_SCHEMA_VERSION

export interface AstroEngineMetadata {
  id: AstroEngineId
  name: string
  accuracyClass: AstroAccuracyClass
  validationStatus: AstroValidationStatus
  calculationBasis: 'internal_approximate_algorithms'
  usesSwissEphemeris: false
  claimsProductionPrecision: false
}

export interface AstroFactsMetadata {
  schemaVersion: AstroFactsSchemaVersion
  engineId: AstroEngineId
  accuracyClass: AstroAccuracyClass
  validationStatus: AstroValidationStatus
  generatedBy: AstroEngineMetadata
}

export const INTERNAL_APPROX_ASTRO_ENGINE: AstroEngineMetadata = Object.freeze({
  id: ASTRO_ENGINE_ID,
  name: 'Internal approximate astrology engine',
  accuracyClass: ASTRO_ACCURACY_CLASS,
  validationStatus: ASTRO_VALIDATION_STATUS,
  calculationBasis: 'internal_approximate_algorithms',
  usesSwissEphemeris: false,
  claimsProductionPrecision: false,
})

export function createAstroFactsMetadata(): AstroFactsMetadata {
  return {
    schemaVersion: ASTRO_FACTS_SCHEMA_VERSION,
    engineId: ASTRO_ENGINE_ID,
    accuracyClass: ASTRO_ACCURACY_CLASS,
    validationStatus: ASTRO_VALIDATION_STATUS,
    generatedBy: { ...INTERNAL_APPROX_ASTRO_ENGINE },
  }
}

export function isAstroFactsMetadata(value: unknown): value is AstroFactsMetadata {
  const candidate = value as Partial<AstroFactsMetadata> | null
  return (
    !!candidate &&
    candidate.schemaVersion === ASTRO_FACTS_SCHEMA_VERSION &&
    candidate.engineId === ASTRO_ENGINE_ID &&
    candidate.accuracyClass === ASTRO_ACCURACY_CLASS &&
    candidate.validationStatus === ASTRO_VALIDATION_STATUS
  )
}
