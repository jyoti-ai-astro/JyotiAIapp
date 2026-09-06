import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import {
  getAllFeatureKeys,
  getFeatureAccess,
  FEATURE_ACCESS,
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

const ROOT_DIR = process.cwd()

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

function testPaymentAccessBackwardCompatibility() {
  const canonicalKeys = getAllFeatureKeys()
  assert.equal(canonicalKeys.length, 17)

  for (const key of canonicalKeys) {
    const combined = getFeatureReadinessWithAccess(key)
    const directAccess = getFeatureAccess(key)
    const rawConfig = FEATURE_ACCESS[key]

    assert.equal(combined.key, key)
    assert.equal(combined.access.key, key)
    assert.equal(combined.access.label, directAccess.label)
    assert.equal(combined.access.ticketField, directAccess.ticketField)
    assert.equal(combined.access.costPerUse, directAccess.costPerUse)
    assert.equal(combined.access.defaultProductId, directAccess.defaultProductId)

    assert.equal(directAccess.key, rawConfig.key)
    assert.equal(directAccess.label, rawConfig.label)
    assert.equal(directAccess.ticketField, rawConfig.ticketField)
    assert.equal(directAccess.costPerUse, rawConfig.costPerUse)
    assert.equal(directAccess.defaultProductId, rawConfig.defaultProductId)

    assert.ok(
      directAccess.costPerUse > 0,
      `costPerUse must be positive for '${key}'`
    )
    assert.ok(
      ['aiGuruTickets', 'kundaliTickets', 'lifetimePredictions'].includes(
        directAccess.ticketField
      ),
      `Invalid ticketField on '${key}'`
    )
    assert.ok(
      ['99', '199', '299'].includes(directAccess.defaultProductId),
      `Invalid defaultProductId on '${key}'`
    )
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
  assert.equal(isTruthQuality('mock'), true)
  assert.equal(isTruthQuality('approximate'), true)
  assert.equal(isTruthQuality('heuristic'), true)
  assert.equal(isTruthQuality('verified'), true)
  assert.equal(isTruthQuality('authoritative'), true)
  assert.equal(isTruthQuality('invalid_quality'), false)
  assert.equal(isTruthQuality(undefined), false)

  // dependencyHealth
  assert.equal(isDependencyHealth('healthy'), true)
  assert.equal(isDependencyHealth('degraded'), true)
  assert.equal(isDependencyHealth('failing'), true)
  assert.equal(isDependencyHealth('unavailable'), true)
  assert.equal(isDependencyHealth('mocked'), true)
  assert.equal(isDependencyHealth('unconfigured'), true)
  assert.equal(isDependencyHealth('broken'), false)

  // userExposure
  assert.equal(isUserExposure('hidden'), true)
  assert.equal(isUserExposure('gated'), true)
  assert.equal(isUserExposure('public'), true)
  assert.equal(isUserExposure('disabled'), true)
  assert.equal(isUserExposure('preview_visible'), true)
  assert.equal(isUserExposure('preview-visible'), true)
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

function testUserExposureExplicitSemantics() {
  // Check type guards for newly supported semantics
  assert.equal(isUserExposure('disabled'), true, "'disabled' must be recognized as valid UserExposure")
  assert.equal(isUserExposure('preview_visible'), true, "'preview_visible' must be recognized as valid UserExposure")
  assert.equal(isUserExposure('preview-visible'), true, "'preview-visible' must be recognized as valid UserExposure")

  // Check query utility for disabled features
  const disabledFeatures = getFeaturesByUserExposure('disabled')
  const disabledKeys = disabledFeatures.map((f) => f.key)
  assert.equal(disabledKeys.length, 3, 'Expected exactly 3 disabled features (business, compatibility, face)')
  assert.ok(disabledKeys.includes('business'), 'business must be exposed as disabled')
  assert.ok(disabledKeys.includes('compatibility'), 'compatibility must be exposed as disabled')
  assert.ok(disabledKeys.includes('face'), 'face must be exposed as disabled')

  // Check query utility for preview_visible features (both underscore and hyphen variants)
  const previewFeaturesUnderscore = getFeaturesByUserExposure('preview_visible')
  const previewKeysUnderscore = previewFeaturesUnderscore.map((f) => f.key)
  assert.ok(previewKeysUnderscore.includes('calendar'), 'calendar must be exposed as preview_visible')
  assert.ok(previewKeysUnderscore.includes('pregnancy'), 'pregnancy must be exposed as preview_visible')

  const previewFeaturesHyphen = getFeaturesByUserExposure('preview-visible')
  const previewKeysHyphen = previewFeaturesHyphen.map((f) => f.key)
  assert.deepEqual(previewKeysHyphen, previewKeysUnderscore, 'preview-visible query must match preview_visible')

  // Check gated features (12 active gated features)
  const gatedFeatures = getFeaturesByUserExposure('gated')
  assert.equal(gatedFeatures.length, 12, 'Expected 12 active ticket-gated features')
}

function testDependencyHealthUnavailableSemantics() {
  assert.equal(isDependencyHealth('unavailable'), true, "'unavailable' must be valid DependencyHealth")

  const unavailableFeatures = getFeaturesByDependencyHealth('unavailable')
  const unavailableKeys = unavailableFeatures.map((f) => f.key)
  assert.equal(unavailableKeys.length, 3, 'Expected 3 features with unavailable dependencies')
  assert.ok(unavailableKeys.includes('business'))
  assert.ok(unavailableKeys.includes('compatibility'))
  assert.ok(unavailableKeys.includes('face'))

  const failingFeatures = getFeaturesByDependencyHealth('failing')
  const failingKeys = failingFeatures.map((f) => f.key)
  assert.ok(failingKeys.includes('calendar'), 'calendar dependencyHealth must be failing due to 503 backend routes')
}

function testRepositoryTruthForDisabledHooksAndUIs() {
  // Business hook & UI truth
  const businessHookSource = fs.readFileSync(
    path.join(ROOT_DIR, 'lib/hooks/useBusiness.ts'),
    'utf8'
  )
  assert.ok(
    businessHookSource.includes('Business analysis is temporarily unavailable while the calculation engine is being upgraded'),
    'useBusiness hook must contain truthful unavailable upgrade error'
  )

  const businessPageSource = fs.readFileSync(
    path.join(ROOT_DIR, 'app/business/page.tsx'),
    'utf8'
  )
  assert.ok(
    businessPageSource.includes('Business analysis is being upgraded') &&
      businessPageSource.includes('Analysis is temporarily unavailable and no credit will be used'),
    'app/business/page.tsx must display upgrade banner warning'
  )
  assert.ok(
    businessPageSource.includes('<Button disabled') &&
      businessPageSource.includes('Analysis temporarily unavailable'),
    'app/business/page.tsx must have disabled action button'
  )

  const businessRecord = getFeatureReadiness('business')
  assert.equal(businessRecord.implementationStatus, 'stub')
  assert.equal(businessRecord.truthQuality, 'placeholder')
  assert.equal(businessRecord.dependencyHealth, 'unavailable')
  assert.equal(businessRecord.userExposure, 'disabled')

  // Compatibility hook & UI truth
  const compatibilityHookSource = fs.readFileSync(
    path.join(ROOT_DIR, 'lib/hooks/useCompatibility.ts'),
    'utf8'
  )
  assert.ok(
    compatibilityHookSource.includes('Compatibility analysis is temporarily unavailable while partner birth-chart generation is being upgraded'),
    'useCompatibility hook must contain truthful unavailable message'
  )

  const compatibilityPageSource = fs.readFileSync(
    path.join(ROOT_DIR, 'app/compatibility/page.tsx'),
    'utf8'
  )
  assert.ok(
    compatibilityPageSource.includes('const compatibilityAvailable = false;'),
    'app/compatibility/page.tsx must disable compatibilityAvailable'
  )
  assert.ok(
    compatibilityPageSource.includes('Compatibility analysis is temporarily unavailable'),
    'app/compatibility/page.tsx must display unavailable warning banner'
  )

  const compatibilityRecord = getFeatureReadiness('compatibility')
  assert.equal(compatibilityRecord.implementationStatus, 'stub')
  assert.equal(compatibilityRecord.truthQuality, 'placeholder')
  assert.equal(compatibilityRecord.dependencyHealth, 'unavailable')
  assert.equal(compatibilityRecord.userExposure, 'disabled')

  // Face Reading hook & UI truth
  const faceHookSource = fs.readFileSync(
    path.join(ROOT_DIR, 'lib/hooks/useFaceReading.ts'),
    'utf8'
  )
  assert.ok(
    faceHookSource.includes('Face reading is temporarily unavailable while image analysis is being upgraded'),
    'useFaceReading hook must contain truthful unavailable error'
  )

  const facePageSource = fs.readFileSync(
    path.join(ROOT_DIR, 'app/face/page.tsx'),
    'utf8'
  )
  assert.ok(
    facePageSource.includes('const faceReadingAvailable = false;'),
    'app/face/page.tsx must disable faceReadingAvailable'
  )
  assert.ok(
    facePageSource.includes('disabled={!faceReadingAvailable}'),
    'app/face/page.tsx file input must be disabled'
  )
  assert.ok(
    facePageSource.includes('Face Reading temporarily unavailable'),
    'app/face/page.tsx button must reflect temporarily unavailable state'
  )

  const faceRecord = getFeatureReadiness('face')
  assert.equal(faceRecord.implementationStatus, 'stub')
  assert.equal(faceRecord.truthQuality, 'placeholder')
  assert.equal(faceRecord.dependencyHealth, 'unavailable')
  assert.equal(faceRecord.userExposure, 'disabled')
}

function testRepositoryTruthForCalendarAnd503Apis() {
  // Calendar component deterministic preview truth
  const calendarComponentSource = fs.readFileSync(
    path.join(ROOT_DIR, 'components/calendar/CosmicCalendar.tsx'),
    'utf8'
  )
  assert.ok(
    calendarComponentSource.includes('Deterministic preview data.'),
    'CosmicCalendar.tsx must document deterministic preview adapter'
  )
  assert.ok(
    calendarComponentSource.includes('Guidance shown here is a deterministic interface preview'),
    'CosmicCalendar.tsx must display preview notice to users'
  )
  assert.ok(
    calendarComponentSource.includes('Calendar guidance preview'),
    'CosmicCalendar.tsx must display preview badge'
  )

  const calendarRecord = getFeatureReadiness('calendar')
  assert.equal(calendarRecord.truthQuality, 'mock', 'calendar truthQuality must be mock (deterministic preview adapter)')
  assert.equal(calendarRecord.userExposure, 'preview_visible', 'calendar userExposure must be preview_visible')

  // Festival API 503 truth
  const festivalRouteSource = fs.readFileSync(
    path.join(ROOT_DIR, 'app/api/festival/today/route.ts'),
    'utf8'
  )
  assert.ok(
    festivalRouteSource.includes('FESTIVAL_ENGINE_UNAVAILABLE'),
    'Festival today route must return FESTIVAL_ENGINE_UNAVAILABLE'
  )
  assert.ok(
    festivalRouteSource.includes('{ status: 503 }'),
    'Festival today route must return HTTP 503'
  )

  // Transit API 503 truth
  const transitRouteSource = fs.readFileSync(
    path.join(ROOT_DIR, 'app/api/transits/upcoming/route.ts'),
    'utf8'
  )
  assert.ok(
    transitRouteSource.includes('TRANSIT_ENGINE_UNAVAILABLE'),
    'Transit upcoming route must return TRANSIT_ENGINE_UNAVAILABLE'
  )
  assert.ok(
    transitRouteSource.includes('{ status: 503 }'),
    'Transit upcoming route must return HTTP 503'
  )

  assert.equal(calendarRecord.dependencyHealth, 'failing', 'calendar dependencyHealth must be failing due to 503 endpoints')
}

function testRepositoryTruthForFilesystemDependenciesAndRoutes() {
  const allRecords = getAllFeatureReadiness()

  for (const record of allRecords) {
    if (record.route) {
      const pagePath = path.join(ROOT_DIR, 'app', record.route, 'page.tsx')
      assert.ok(
        fs.existsSync(pagePath),
        `Route file '${pagePath}' must exist for feature '${record.key}'`
      )
    }

    if (record.dependencies && record.dependencies.length > 0) {
      for (const dep of record.dependencies) {
        const depPath = path.join(ROOT_DIR, dep)
        assert.ok(
          fs.existsSync(depPath),
          `Dependency file '${depPath}' must exist on disk for feature '${record.key}'`
        )
      }
    }
  }
}

function testRepositoryTruthForRuntimeVerification() {
  const allRecords = getAllFeatureReadiness()

  for (const record of allRecords) {
    if (record.key === 'kundali') {
      assert.equal(record.runtimeVerified, true)
      assert.ok(
        fs.existsSync(path.join(ROOT_DIR, 'tests/astro-foundation.test.ts')),
        'tests/astro-foundation.test.ts must exist on disk for kundali runtime verification'
      )
    } else {
      assert.equal(
        record.runtimeVerified,
        false,
        `Feature '${record.key}' must not claim runtimeVerified prior to automated verification test suite`
      )
    }
  }
}

function testProductionEligibilityEvaluation() {
  // Stub feature evaluation
  const pregnancyRecord = getFeatureReadiness('pregnancy')
  const pregnancyEval = evaluateProductionEligibility(pregnancyRecord)
  assert.equal(pregnancyEval.declaredEligible, false)
  assert.equal(pregnancyEval.criteriaMet, false)
  assert.equal(pregnancyEval.isConsistent, true)
  assert.ok(pregnancyEval.failingCriteria.length >= 3)

  // Disabled feature evaluation
  const businessRecord = getFeatureReadiness('business')
  const businessEval = evaluateProductionEligibility(businessRecord)
  assert.equal(businessEval.declaredEligible, false)
  assert.equal(businessEval.criteriaMet, false)
  assert.equal(businessEval.isConsistent, true)
  assert.ok(
    businessEval.failingCriteria.some((c) => c.includes('userExposure is \'disabled\'')),
    'Disabled feature must fail production eligibility on userExposure'
  )

  // Preview feature evaluation
  const calendarRecord = getFeatureReadiness('calendar')
  const calendarEval = evaluateProductionEligibility(calendarRecord)
  assert.equal(calendarEval.declaredEligible, false)
  assert.equal(calendarEval.criteriaMet, false)
  assert.equal(calendarEval.isConsistent, true)
  assert.ok(
    calendarEval.failingCriteria.some((c) => c.includes('preview_visible')),
    'Preview feature must fail production eligibility on userExposure'
  )

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
  assert.equal(summary.runtimeVerifiedCount, 1) // kundali

  // Implementation status breakdown
  assert.equal(summary.byImplementationStatus.complete, 5) // kundali, numerology, planets, houses, dasha
  assert.equal(summary.byImplementationStatus.partial, 8)  // career, palmistry, aura, calendar, rituals, charts, predictions, timeline
  assert.equal(summary.byImplementationStatus.stub, 4)     // business, compatibility, face, pregnancy
  assert.equal(summary.byImplementationStatus.deprecated, 0)

  // Truth quality breakdown
  assert.equal(summary.byTruthQuality.placeholder, 4)   // business, compatibility, face, pregnancy
  assert.equal(summary.byTruthQuality.mock, 1)          // calendar
  assert.equal(summary.byTruthQuality.approximate, 6)   // kundali, planets, houses, dasha, charts, timeline
  assert.equal(summary.byTruthQuality.heuristic, 5)     // career, palmistry, aura, rituals, predictions
  assert.equal(summary.byTruthQuality.verified, 1)      // numerology
  assert.equal(summary.byTruthQuality.authoritative, 0)

  // Dependency health breakdown
  assert.equal(summary.byDependencyHealth.healthy, 10)     // kundali, career, numerology, rituals, planets, houses, dasha, charts, predictions, timeline
  assert.equal(summary.byDependencyHealth.degraded, 2)    // palmistry, aura
  assert.equal(summary.byDependencyHealth.failing, 1)     // calendar
  assert.equal(summary.byDependencyHealth.unavailable, 3) // business, compatibility, face
  assert.equal(summary.byDependencyHealth.unconfigured, 1) // pregnancy

  // User exposure breakdown
  assert.equal(summary.byUserExposure.gated, 12)
  assert.equal(summary.byUserExposure.disabled, 3)          // business, compatibility, face
  assert.equal(summary.byUserExposure.preview_visible, 2)   // calendar, pregnancy

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
  testPaymentAccessBackwardCompatibility()
  testUserExposureExplicitSemantics()
  testDependencyHealthUnavailableSemantics()
  testRepositoryTruthForDisabledHooksAndUIs()
  testRepositoryTruthForCalendarAnd503Apis()
  testRepositoryTruthForFilesystemDependenciesAndRoutes()
  testRepositoryTruthForRuntimeVerification()
  testTypeGuards()
  testProductionEligibilityEvaluation()
  testFeatureReadinessSummary()
  testValidateRegistry()
  testCorruptedRegistryFailsValidation()
  console.log('Feature readiness foundation tests passed successfully.')
}

main()
