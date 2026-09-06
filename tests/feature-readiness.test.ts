import assert from 'node:assert/strict'

import {
  getAllFeatureKeys,
  getFeatureAccess,
  type FeatureKey,
} from '../lib/payments/feature-access'
import {
  DEPENDENCY_HEALTH_STATUSES,
  FEATURE_READINESS_REGISTRY,
  IMPLEMENTATION_STATUSES,
  TRUTH_QUALITIES,
  USER_EXPOSURES,
  evaluateProductionEligibility,
  getAllFeatureReadiness,
  getFeatureReadiness,
  getFeatureReadinessSummary,
  getFeatureReadinessWithAccess,
  getFeaturesByDependencyHealth,
  getFeaturesByImplementationStatus,
  getFeaturesByTruthQuality,
  getFeaturesByUserExposure,
  getProductionEligibleFeatures,
  isDependencyHealth,
  isFeatureReadinessRecord,
  isImplementationStatus,
  isTruthQuality,
  isUserExposure,
  validateFeatureReadinessRegistry,
  type FeatureReadinessRecord,
} from '../lib/readiness'

function testAllFeatureAccessKeysMapped() {
  const canonicalKeys = getAllFeatureKeys()
  assert.equal(canonicalKeys.length, 17, 'Expected exactly 17 canonical payment/access keys')

  const registryKeys = Object.keys(FEATURE_READINESS_REGISTRY) as FeatureKey[]
  assert.equal(registryKeys.length, 17, 'Registry must contain exactly 17 keys')

  for (const key of canonicalKeys) {
    const record = FEATURE_READINESS_REGISTRY[key]
    assert.ok(record, `Feature readiness registry missing entry for key: ${key}`)
    assert.equal(record.key, key)
    assert.ok(typeof record.label === 'string' && record.label.length > 0)
  }
}

function testMultiDimensionalSchemaIntegrity() {
  const allRecords = getAllFeatureReadiness()
  assert.equal(allRecords.length, 17)

  for (const record of allRecords) {
    // 1. implementationStatus
    assert.ok(
      IMPLEMENTATION_STATUSES.includes(record.implementationStatus),
      `Invalid implementationStatus '${record.implementationStatus}' on '${record.key}'`
    )

    // 2. runtimeVerified
    assert.equal(
      typeof record.runtimeVerified,
      'boolean',
      `runtimeVerified must be boolean on '${record.key}'`
    )

    // 3. truthQuality
    assert.ok(
      TRUTH_QUALITIES.includes(record.truthQuality),
      `Invalid truthQuality '${record.truthQuality}' on '${record.key}'`
    )

    // 4. dependencyHealth
    assert.ok(
      DEPENDENCY_HEALTH_STATUSES.includes(record.dependencyHealth),
      `Invalid dependencyHealth '${record.dependencyHealth}' on '${record.key}'`
    )

    // 5. userExposure
    assert.ok(
      USER_EXPOSURES.includes(record.userExposure),
      `Invalid userExposure '${record.userExposure}' on '${record.key}'`
    )

    // 6. productionEligible
    assert.equal(
      typeof record.productionEligible,
      'boolean',
      `productionEligible must be boolean on '${record.key}'`
    )
  }
}

function testPaymentAccessReferencePreserved() {
  const canonicalKeys = getAllFeatureKeys()

  for (const key of canonicalKeys) {
    const combined = getFeatureReadinessWithAccess(key)
    const directAccess = getFeatureAccess(key)

    assert.equal(combined.key, key)
    assert.equal(combined.access.key, key)
    assert.equal(combined.access.label, directAccess.label)
    assert.equal(combined.access.ticketField, directAccess.ticketField)
    assert.equal(combined.access.costPerUse, directAccess.costPerUse)
    assert.equal(combined.access.defaultProductId, directAccess.defaultProductId)
  }
}

function testTypeGuards() {
  // implementationStatus
  assert.equal(isImplementationStatus('complete'), true)
  assert.equal(isImplementationStatus('partial'), true)
  assert.equal(isImplementationStatus('stub'), true)
  assert.equal(isImplementationStatus('deprecated'), true)
  assert.equal(isImplementationStatus('unknown_status'), false)
  assert.equal(isImplementationStatus(null), false)
  assert.equal(isImplementationStatus(42), false)

  // truthQuality
  assert.equal(isTruthQuality('placeholder'), true)
  assert.equal(isTruthQuality('approximate'), true)
  assert.equal(isTruthQuality('verified'), true)
  assert.equal(isTruthQuality('authoritative'), true)
  assert.equal(isTruthQuality('invalid_quality'), false)
  assert.equal(isTruthQuality(undefined), false)

  // dependencyHealth
  assert.equal(isDependencyHealth('healthy'), true)
  assert.equal(isDependencyHealth('degraded'), true)
  assert.equal(isDependencyHealth('failing'), true)
  assert.equal(isDependencyHealth('mocked'), true)
  assert.equal(isDependencyHealth('unconfigured'), true)
  assert.equal(isDependencyHealth('broken'), false)

  // userExposure
  assert.equal(isUserExposure('hidden'), true)
  assert.equal(isUserExposure('gated'), true)
  assert.equal(isUserExposure('public'), true)
  assert.equal(isUserExposure('all'), false)

  // isFeatureReadinessRecord
  const validRecord = getFeatureReadiness('kundali')
  assert.equal(isFeatureReadinessRecord(validRecord), true)
  assert.equal(isFeatureReadinessRecord(null), false)
  assert.equal(isFeatureReadinessRecord({}), false)
  assert.equal(
    isFeatureReadinessRecord({
      ...validRecord,
      implementationStatus: 'invalid',
    }),
    false
  )
}

function testQueryAndFilterUtilities() {
  // Stubs: pregnancy
  const stubs = getFeaturesByImplementationStatus('stub')
  assert.ok(stubs.some((f) => f.key === 'pregnancy'))

  // Complete: kundali, numerology, planets, houses, dasha
  const complete = getFeaturesByImplementationStatus('complete')
  const completeKeys = complete.map((f) => f.key)
  assert.ok(completeKeys.includes('kundali'))
  assert.ok(completeKeys.includes('numerology'))
  assert.ok(completeKeys.includes('planets'))
  assert.ok(completeKeys.includes('houses'))
  assert.ok(completeKeys.includes('dasha'))

  // Truth quality approximate: kundali, planets, houses, dasha, charts, timeline, compatibility, calendar
  const approximate = getFeaturesByTruthQuality('approximate')
  assert.ok(approximate.some((f) => f.key === 'kundali'))
  assert.ok(approximate.some((f) => f.key === 'planets'))

  // Degraded dependencies: multimodal AI features (face, palmistry, aura)
  const degraded = getFeaturesByDependencyHealth('degraded')
  const degradedKeys = degraded.map((f) => f.key)
  assert.ok(degradedKeys.includes('face'))
  assert.ok(degradedKeys.includes('palmistry'))
  assert.ok(degradedKeys.includes('aura'))

  // User exposure: all 17 features are currently gated by tickets
  const gated = getFeaturesByUserExposure('gated')
  assert.equal(gated.length, 17)

  // Production eligible: none currently claim production eligibility prior to benchmarked ephemeris validation
  const eligible = getProductionEligibleFeatures()
  assert.equal(eligible.length, 0)
}

function testProductionEligibilityEvaluation() {
  // Stub feature evaluation
  const pregnancyRecord = getFeatureReadiness('pregnancy')
  const pregnancyEval = evaluateProductionEligibility(pregnancyRecord)
  assert.equal(pregnancyEval.declaredEligible, false)
  assert.equal(pregnancyEval.criteriaMet, false)
  assert.equal(pregnancyEval.isConsistent, true)
  assert.ok(pregnancyEval.failingCriteria.length >= 3)

  // Approximate feature evaluation
  const kundaliRecord = getFeatureReadiness('kundali')
  const kundaliEval = evaluateProductionEligibility(kundaliRecord)
  assert.equal(kundaliEval.declaredEligible, false)
  assert.equal(kundaliEval.criteriaMet, false)
  assert.equal(kundaliEval.isConsistent, true)
  assert.ok(
    kundaliEval.failingCriteria.some((c) => c.includes('truthQuality'))
  )

  // Synthetic eligible record passes criteria
  const syntheticProductionReady: FeatureReadinessRecord = {
    key: 'kundali',
    label: 'Kundali Verified',
    implementationStatus: 'complete',
    runtimeVerified: true,
    truthQuality: 'authoritative',
    dependencyHealth: 'healthy',
    userExposure: 'gated',
    productionEligible: true,
  }
  const syntheticEval = evaluateProductionEligibility(syntheticProductionReady)
  assert.equal(syntheticEval.criteriaMet, true)
  assert.equal(syntheticEval.isConsistent, true)
  assert.equal(syntheticEval.failingCriteria.length, 0)

  // Inconsistent record (claims eligible when criteria not met)
  const fraudulentRecord: FeatureReadinessRecord = {
    ...pregnancyRecord,
    productionEligible: true,
  }
  const fraudEval = evaluateProductionEligibility(fraudulentRecord)
  assert.equal(fraudEval.criteriaMet, false)
  assert.equal(fraudEval.isConsistent, false)
}

function testFeatureReadinessSummary() {
  const summary = getFeatureReadinessSummary()

  assert.equal(summary.totalFeatures, 17)
  assert.equal(summary.productionEligibleCount, 0)
  assert.equal(summary.productionIneligibleCount, 17)
  assert.equal(summary.runtimeVerifiedCount, 1) // kundali has tests/astro-foundation.test.ts

  const statusSum = Object.values(summary.byImplementationStatus).reduce((a, b) => a + b, 0)
  assert.equal(statusSum, 17)

  const qualitySum = Object.values(summary.byTruthQuality).reduce((a, b) => a + b, 0)
  assert.equal(qualitySum, 17)

  const healthSum = Object.values(summary.byDependencyHealth).reduce((a, b) => a + b, 0)
  assert.equal(healthSum, 17)

  const exposureSum = Object.values(summary.byUserExposure).reduce((a, b) => a + b, 0)
  assert.equal(exposureSum, 17)
}

function testValidateRegistry() {
  const result = validateFeatureReadinessRegistry()
  assert.equal(result.valid, true, `Validation failed with errors: ${result.errors.join(', ')}`)
  assert.equal(result.errors.length, 0)
}

function testCorruptedRegistryFailsValidation() {
  const corrupted = {
    ...FEATURE_READINESS_REGISTRY,
    pregnancy: {
      ...FEATURE_READINESS_REGISTRY.pregnancy,
      productionEligible: true, // Inconsistent with stub/placeholder
    },
  }
  const result = validateFeatureReadinessRegistry(corrupted)
  assert.equal(result.valid, false)
  assert.ok(result.errors.some((e) => e.includes('Inconsistent production eligibility for \'pregnancy\'')))
}

function main() {
  testAllFeatureAccessKeysMapped()
  testMultiDimensionalSchemaIntegrity()
  testPaymentAccessReferencePreserved()
  testTypeGuards()
  testQueryAndFilterUtilities()
  testProductionEligibilityEvaluation()
  testFeatureReadinessSummary()
  testValidateRegistry()
  testCorruptedRegistryFailsValidation()
  console.log('Feature readiness foundation tests passed successfully.')
}

main()
