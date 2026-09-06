/**
 * Feature Readiness Registry
 * 
 * Canonical multi-dimensional readiness registry for JyotiAI features.
 * Maps every canonical payment/access key from lib/payments/feature-access.ts
 * to its verified readiness state across:
 * - implementationStatus
 * - runtimeVerified
 * - truthQuality
 * - dependencyHealth
 * - userExposure
 * - productionEligible
 */

import {
  FEATURE_ACCESS,
  getAllFeatureKeys,
  getFeatureAccess,
  type FeatureKey,
} from '../payments/feature-access'
import {
  DEPENDENCY_HEALTH_STATUSES,
  IMPLEMENTATION_STATUSES,
  TRUTH_QUALITIES,
  USER_EXPOSURES,
  type DependencyHealth,
  type DependencyHealthStatus,
  type FeatureReadinessRecord,
  type FeatureReadinessRegistry,
  type FeatureReadinessSummary,
  type FeatureReadinessWithAccess,
  type ImplementationStatus,
  type ProductionEligibilityEvaluation,
  type TruthQuality,
  type UserExposure,
} from './types'

/**
 * Canonical registry entries for all features.
 * Reflects verified codebase state truthfully without premature claims.
 */
export const FEATURE_READINESS_REGISTRY: FeatureReadinessRegistry = {
  kundali: {
    key: 'kundali',
    label: 'Kundali Reading',
    route: '/kundali',
    implementationStatus: 'complete',
    runtimeVerified: true,
    truthQuality: 'approximate',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/engines/kundali-engine.ts', 'lib/engines/astro-facts.ts'],
    notes: 'Engine active as internal_approx_v1 with APPROXIMATE and UNVALIDATED truth quality.',
  },
  career: {
    key: 'career',
    label: 'Career Destiny',
    route: '/career',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'heuristic',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/access/useTicketAccess.ts', 'lib/ai'],
    notes: 'Normalized dark observatory UI; calculation relies on heuristic prompt generation.',
  },
  business: {
    key: 'business',
    label: 'Business Compatibility',
    route: '/business',
    implementationStatus: 'stub',
    runtimeVerified: false,
    truthQuality: 'placeholder',
    dependencyHealth: 'unavailable',
    userExposure: 'disabled',
    productionEligible: false,
    dependencies: ['lib/hooks/useBusiness.ts', 'app/business/page.tsx'],
    notes: 'Runtime hook useBusiness throws unavailable error; UI analysis button is disabled while canonical calculation engine is being upgraded.',
  },
  compatibility: {
    key: 'compatibility',
    label: 'Compatibility Analysis',
    route: '/compatibility',
    implementationStatus: 'stub',
    runtimeVerified: false,
    truthQuality: 'placeholder',
    dependencyHealth: 'unavailable',
    userExposure: 'disabled',
    productionEligible: false,
    dependencies: ['lib/hooks/useCompatibility.ts', 'app/compatibility/page.tsx'],
    notes: 'Runtime hook useCompatibility returns unavailable error; partner birth-chart form is disabled in UI while calculation path is being upgraded.',
  },
  numerology: {
    key: 'numerology',
    label: 'Numerology',
    route: '/numerology',
    implementationStatus: 'complete',
    runtimeVerified: false,
    truthQuality: 'verified',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/engines/numerology/calculator.ts'],
    notes: 'Deterministic Pythagorean/Chaldean calculator implemented; awaiting runtime automated test suite.',
  },
  face: {
    key: 'face',
    label: 'Face Reading',
    route: '/face',
    implementationStatus: 'stub',
    runtimeVerified: false,
    truthQuality: 'placeholder',
    dependencyHealth: 'unavailable',
    userExposure: 'disabled',
    productionEligible: false,
    dependencies: ['lib/hooks/useFaceReading.ts', 'app/face/page.tsx'],
    notes: 'Runtime hook useFaceReading throws unavailable error; file upload input and analysis button are disabled in UI while verified server analysis is being implemented.',
  },
  palmistry: {
    key: 'palmistry',
    label: 'Palmistry',
    route: '/palmistry',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'heuristic',
    dependencyHealth: 'degraded',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/hooks/usePalmistry.ts', 'components/palmistry/CosmicPalmistry.tsx'],
    notes: 'Dual palm image upload and vision pipeline; depends on active external multimodal API key.',
  },
  aura: {
    key: 'aura',
    label: 'Aura Scan',
    route: '/aura',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'heuristic',
    dependencyHealth: 'degraded',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/hooks/useAuraScan.ts', 'components/aura/CosmicAura.tsx'],
    notes: 'Selfie aura analysis workflow; relies on third-party visual heuristic processing.',
  },
  calendar: {
    key: 'calendar',
    label: 'Cosmic Calendar',
    route: '/calendar',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'mock',
    dependencyHealth: 'failing',
    userExposure: 'preview_visible',
    productionEligible: false,
    dependencies: [
      'components/calendar/CosmicCalendar.tsx',
      'app/api/festival/today/route.ts',
      'app/api/transits/upcoming/route.ts',
    ],
    notes: 'UI renders deterministic preview calendar (mock tithi/nakshatra seed data); backend festival (/api/festival/today) and transit (/api/transits/upcoming) endpoints return 503 unavailable.',
  },
  rituals: {
    key: 'rituals',
    label: 'Vedic Rituals',
    route: '/rituals',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'heuristic',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['app/rituals/page.tsx'],
    notes: 'Remedy catalog and customized puja/mantra recommendations based on heuristic guidelines.',
  },
  planets: {
    key: 'planets',
    label: 'Planetary Positions',
    route: '/planets',
    implementationStatus: 'complete',
    runtimeVerified: false,
    truthQuality: 'approximate',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/hooks/useKundali.ts', 'components/planets/PlanetsView.tsx'],
    notes: 'Displays 9 grahas with degrees and nakshatras computed via approximate astro engine.',
  },
  pregnancy: {
    key: 'pregnancy',
    label: 'Pregnancy Insights',
    route: '/pregnancy',
    implementationStatus: 'stub',
    runtimeVerified: false,
    truthQuality: 'placeholder',
    dependencyHealth: 'unconfigured',
    userExposure: 'preview_visible',
    productionEligible: false,
    dependencies: ['app/pregnancy/page.tsx'],
    notes: 'Preview shell only; domain calculation and recommendation logic not yet implemented.',
  },
  houses: {
    key: 'houses',
    label: '12 Houses',
    route: '/houses',
    implementationStatus: 'complete',
    runtimeVerified: false,
    truthQuality: 'approximate',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/hooks/useKundali.ts', 'components/houses/HousesGrid.tsx'],
    notes: 'Twelve bhava grid visualizer mapped to whole-sign cusps from internal approximate engine.',
  },
  dasha: {
    key: 'dasha',
    label: 'Dasha Timeline',
    route: '/dasha',
    implementationStatus: 'complete',
    runtimeVerified: false,
    truthQuality: 'approximate',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/hooks/useKundali.ts', 'components/astro/DashaTimeline.tsx'],
    notes: 'Vimshottari mahadasha and antardasha timeline based on approximate moon nakshatra longitude.',
  },
  charts: {
    key: 'charts',
    label: 'Divisional Charts',
    route: '/charts',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'approximate',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/engines/kundali/divisional-charts.ts', 'components/charts/DivisionalCharts.tsx'],
    notes: 'D1 computed; D9 Navamsha and D10 Dashamsha use mathematical modulo approximations.',
  },
  predictions: {
    key: 'predictions',
    label: 'Predictions',
    route: '/predictions',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'heuristic',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['app/predictions/page.tsx', 'lib/ai'],
    notes: 'Life predictions assembled from chart overview and AI prompt synthesis.',
  },
  timeline: {
    key: 'timeline',
    label: 'Life Timeline',
    route: '/timeline',
    implementationStatus: 'partial',
    runtimeVerified: false,
    truthQuality: 'approximate',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: false,
    dependencies: ['lib/engines/timeline-engine-v2.ts', 'app/timeline/page.tsx'],
    notes: '12-month event progression combining dasha periods and estimated transits.',
  },
}

/**
 * Retrieve the readiness record for a given feature key
 */
export function getFeatureReadiness(key: FeatureKey): FeatureReadinessRecord {
  const record = FEATURE_READINESS_REGISTRY[key]
  if (!record) {
    throw new Error(`Feature readiness record not found for key: ${key}`)
  }
  return record
}

/**
 * Retrieve the readiness record alongside its payment/access config
 */
export function getFeatureReadinessWithAccess(key: FeatureKey): FeatureReadinessWithAccess {
  const readiness = getFeatureReadiness(key)
  const access = getFeatureAccess(key)
  return {
    ...readiness,
    access,
  }
}

/**
 * List all feature readiness records
 */
export function getAllFeatureReadiness(): FeatureReadinessRecord[] {
  return getAllFeatureKeys().map((key) => FEATURE_READINESS_REGISTRY[key])
}

/**
 * Filter features by implementation status
 */
export function getFeaturesByImplementationStatus(
  status: ImplementationStatus
): FeatureReadinessRecord[] {
  return getAllFeatureReadiness().filter((f) => f.implementationStatus === status)
}

/**
 * Filter features by truth quality
 */
export function getFeaturesByTruthQuality(
  quality: TruthQuality
): FeatureReadinessRecord[] {
  return getAllFeatureReadiness().filter((f) => f.truthQuality === quality)
}

/**
 * Filter features by dependency health
 */
export function getFeaturesByDependencyHealth(
  health: DependencyHealth
): FeatureReadinessRecord[] {
  return getAllFeatureReadiness().filter((f) => f.dependencyHealth === health)
}

/**
 * Filter features by user exposure tier
 */
export function getFeaturesByUserExposure(
  exposure: UserExposure
): FeatureReadinessRecord[] {
  return getAllFeatureReadiness().filter((f) => {
    if (f.userExposure === exposure) return true
    if (
      (exposure === 'preview_visible' && f.userExposure === 'preview-visible') ||
      (exposure === 'preview-visible' && f.userExposure === 'preview_visible')
    ) {
      return true
    }
    return false
  })
}

/**
 * List features marked as production eligible
 */
export function getProductionEligibleFeatures(): FeatureReadinessRecord[] {
  return getAllFeatureReadiness().filter((f) => f.productionEligible)
}

/**
 * Evaluate objective production eligibility criteria for a feature record
 */
export function evaluateProductionEligibility(
  record: FeatureReadinessRecord
): ProductionEligibilityEvaluation {
  const failingCriteria: string[] = []

  if (record.implementationStatus !== 'complete') {
    failingCriteria.push(
      `implementationStatus is '${record.implementationStatus}', expected 'complete'`
    )
  }

  if (record.runtimeVerified !== true) {
    failingCriteria.push('runtimeVerified is false; requires verified automated test execution')
  }

  if (record.truthQuality !== 'verified' && record.truthQuality !== 'authoritative') {
    failingCriteria.push(
      `truthQuality is '${record.truthQuality}', expected 'verified' or 'authoritative'`
    )
  }

  if (record.dependencyHealth !== 'healthy') {
    failingCriteria.push(
      `dependencyHealth is '${record.dependencyHealth}', expected 'healthy'`
    )
  }

  if (
    record.userExposure === 'disabled' ||
    record.userExposure === 'hidden' ||
    record.userExposure === 'dev_only' ||
    record.userExposure === 'preview_visible' ||
    record.userExposure === 'preview-visible'
  ) {
    failingCriteria.push(
      `userExposure is '${record.userExposure}', must be 'gated' or 'public' for production eligibility`
    )
  }

  const criteriaMet = failingCriteria.length === 0
  const isConsistent = record.productionEligible === criteriaMet

  return {
    key: record.key,
    declaredEligible: record.productionEligible,
    criteriaMet,
    isConsistent,
    failingCriteria,
  }
}

/**
 * Aggregate summary metrics across all features in the registry
 */
export function getFeatureReadinessSummary(): FeatureReadinessSummary {
  const all = getAllFeatureReadiness()

  const byImplementationStatus: Record<ImplementationStatus, number> = {
    stub: 0,
    partial: 0,
    complete: 0,
    deprecated: 0,
  }

  const byTruthQuality: Record<TruthQuality, number> = {
    placeholder: 0,
    mock: 0,
    approximate: 0,
    heuristic: 0,
    verified: 0,
    authoritative: 0,
  }

  const byDependencyHealth: Record<DependencyHealthStatus, number> = {
    healthy: 0,
    degraded: 0,
    failing: 0,
    unavailable: 0,
    mocked: 0,
    unconfigured: 0,
  }

  const byUserExposure: Record<UserExposure, number> = {
    hidden: 0,
    internal: 0,
    dev_only: 0,
    beta: 0,
    gated: 0,
    public: 0,
    disabled: 0,
    preview_visible: 0,
    'preview-visible': 0,
  }

  let productionEligibleCount = 0
  let runtimeVerifiedCount = 0

  for (const record of all) {
    byImplementationStatus[record.implementationStatus]++
    byTruthQuality[record.truthQuality]++
    byDependencyHealth[record.dependencyHealth]++
    byUserExposure[record.userExposure]++

    if (record.productionEligible) {
      productionEligibleCount++
    }
    if (record.runtimeVerified) {
      runtimeVerifiedCount++
    }
  }

  return {
    totalFeatures: all.length,
    productionEligibleCount,
    productionIneligibleCount: all.length - productionEligibleCount,
    runtimeVerifiedCount,
    byImplementationStatus,
    byTruthQuality,
    byDependencyHealth,
    byUserExposure,
  }
}

/**
 * Type guards
 */
export function isImplementationStatus(value: unknown): value is ImplementationStatus {
  return typeof value === 'string' && (IMPLEMENTATION_STATUSES as readonly string[]).includes(value)
}

export function isTruthQuality(value: unknown): value is TruthQuality {
  return typeof value === 'string' && (TRUTH_QUALITIES as readonly string[]).includes(value)
}

export function isDependencyHealth(value: unknown): value is DependencyHealth {
  return typeof value === 'string' && (DEPENDENCY_HEALTH_STATUSES as readonly string[]).includes(value)
}

export function isUserExposure(value: unknown): value is UserExposure {
  return typeof value === 'string' && (USER_EXPOSURES as readonly string[]).includes(value)
}

export function isFeatureReadinessRecord(value: unknown): value is FeatureReadinessRecord {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.key === 'string' &&
    typeof candidate.label === 'string' &&
    isImplementationStatus(candidate.implementationStatus) &&
    typeof candidate.runtimeVerified === 'boolean' &&
    isTruthQuality(candidate.truthQuality) &&
    isDependencyHealth(candidate.dependencyHealth) &&
    isUserExposure(candidate.userExposure) &&
    typeof candidate.productionEligible === 'boolean'
  )
}

/**
 * Validate registry integrity and consistency with FEATURE_ACCESS keys
 */
export function validateFeatureReadinessRegistry(
  registry: FeatureReadinessRegistry = FEATURE_READINESS_REGISTRY
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const expectedKeys = getAllFeatureKeys()

  for (const key of expectedKeys) {
    const record = registry[key]
    if (!record) {
      errors.push(`Missing registry entry for FeatureKey: '${key}'`)
      continue
    }

    if (record.key !== key) {
      errors.push(`Key mismatch: entry for '${key}' has key '${record.key}'`)
    }

    if (!isFeatureReadinessRecord(record)) {
      errors.push(`Invalid FeatureReadinessRecord structure for key: '${key}'`)
    }

    const evaluation = evaluateProductionEligibility(record)
    if (!evaluation.isConsistent) {
      errors.push(
        `Inconsistent production eligibility for '${key}': declared=${record.productionEligible}, criteriaMet=${evaluation.criteriaMet}. Issues: ${evaluation.failingCriteria.join('; ')}`
      )
    }
  }

  const actualKeys = Object.keys(registry)
  for (const actualKey of actualKeys) {
    if (!expectedKeys.includes(actualKey as FeatureKey)) {
      errors.push(`Extraneous key in registry not present in FEATURE_ACCESS: '${actualKey}'`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
