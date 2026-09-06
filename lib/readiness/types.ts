/**
 * Feature Readiness Types
 * 
 * Multi-dimensional readiness foundation:
 * - implementationStatus: Code completeness of the feature
 * - runtimeVerified: Whether verified in test/runtime environment
 * - truthQuality: Quality and truthfulness level of calculation/domain output
 * - dependencyHealth: Health and availability of upstream dependencies
 * - userExposure: Visibility and gating tier in user application
 * - productionEligible: Strict gate for production release qualification
 */

import type { FeatureAccessConfig, FeatureKey } from '../payments/feature-access'

/**
 * Code implementation state
 */
export type ImplementationStatus = 'stub' | 'partial' | 'complete' | 'deprecated'

export const IMPLEMENTATION_STATUSES: readonly ImplementationStatus[] = [
  'stub',
  'partial',
  'complete',
  'deprecated',
] as const

/**
 * Quality and truthfulness of feature output
 */
export type TruthQuality =
  | 'placeholder'
  | 'mock'
  | 'approximate'
  | 'heuristic'
  | 'verified'
  | 'authoritative'

export const TRUTH_QUALITIES: readonly TruthQuality[] = [
  'placeholder',
  'mock',
  'approximate',
  'heuristic',
  'verified',
  'authoritative',
] as const

/**
 * Health and availability of required upstream dependencies
 */
export type DependencyHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'failing'
  | 'mocked'
  | 'unconfigured'

export type DependencyHealth = DependencyHealthStatus

export const DEPENDENCY_HEALTH_STATUSES: readonly DependencyHealthStatus[] = [
  'healthy',
  'degraded',
  'failing',
  'mocked',
  'unconfigured',
] as const

/**
 * Visibility and gating tier in user-facing surfaces
 */
export type UserExposure =
  | 'hidden'
  | 'internal'
  | 'dev_only'
  | 'beta'
  | 'gated'
  | 'public'

export const USER_EXPOSURES: readonly UserExposure[] = [
  'hidden',
  'internal',
  'dev_only',
  'beta',
  'gated',
  'public',
] as const

/**
 * Canonical feature readiness record
 */
export interface FeatureReadinessRecord {
  /** Feature identifier referencing canonical payment/access key */
  key: FeatureKey
  /** Human-readable display label */
  label: string
  /** Route or path where the feature is hosted/consumed */
  route?: string
  /** Multi-dimensional readiness: Implementation state of feature code */
  implementationStatus: ImplementationStatus
  /** Multi-dimensional readiness: Whether verified working in test/runtime environment */
  runtimeVerified: boolean
  /** Multi-dimensional readiness: Quality/truth level of feature output */
  truthQuality: TruthQuality
  /** Multi-dimensional readiness: Health status of upstream engines/APIs */
  dependencyHealth: DependencyHealth
  /** Multi-dimensional readiness: Current visibility / exposure to users */
  userExposure: UserExposure
  /** Multi-dimensional readiness: Strict boolean gate for production release eligibility */
  productionEligible: boolean
  /** Dependencies required by this feature */
  dependencies?: readonly string[]
  /** Optional descriptive audit notes or blockers */
  notes?: string
}

/**
 * Registry mapping each FeatureKey to its multi-dimensional readiness descriptor
 */
export type FeatureReadinessRegistry = Record<FeatureKey, FeatureReadinessRecord>

/**
 * Combined feature readiness with payment/access config
 */
export interface FeatureReadinessWithAccess extends FeatureReadinessRecord {
  access: FeatureAccessConfig
}

/**
 * Summary metrics across all features in registry
 */
export interface FeatureReadinessSummary {
  totalFeatures: number
  productionEligibleCount: number
  productionIneligibleCount: number
  runtimeVerifiedCount: number
  byImplementationStatus: Record<ImplementationStatus, number>
  byTruthQuality: Record<TruthQuality, number>
  byDependencyHealth: Record<DependencyHealthStatus, number>
  byUserExposure: Record<UserExposure, number>
}

/**
 * Evaluation result for production eligibility
 */
export interface ProductionEligibilityEvaluation {
  key: FeatureKey
  declaredEligible: boolean
  criteriaMet: boolean
  isConsistent: boolean
  failingCriteria: string[]
}
