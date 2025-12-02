/**
 * Feature Access Configuration
 * 
 * Pricing & Payments v3 - Phase Q
 * 
 * Single source of truth for feature access rules:
 * - Which ticket field each feature uses
 * - Cost per use
 * - Default product ID for upsells
 */

export type TicketField = 'aiGuruTickets' | 'kundaliTickets' | 'lifetimePredictions'

export type FeatureKey =
  | 'kundali'
  | 'career'
  | 'business'
  | 'compatibility'
  | 'face'
  | 'palmistry'
  | 'aura'
  | 'calendar'
  | 'rituals'
  | 'planets'
  | 'pregnancy'
  | 'houses'
  | 'dasha'
  | 'charts'
  | 'predictions'
  | 'timeline'

export interface FeatureAccessConfig {
  key: FeatureKey
  label: string
  ticketField: TicketField
  costPerUse: number
  defaultProductId: '99' | '199' | '299'
}

export const FEATURE_ACCESS: Record<FeatureKey, FeatureAccessConfig> = {
  kundali: {
    key: 'kundali',
    label: 'Kundali Reading',
    ticketField: 'kundaliTickets',
    costPerUse: 1,
    defaultProductId: '199',
  },
  career: {
    key: 'career',
    label: 'Career Destiny',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '299',
  },
  business: {
    key: 'business',
    label: 'Business Compatibility',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '299',
  },
  compatibility: {
    key: 'compatibility',
    label: 'Compatibility Analysis',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '299',
  },
  face: {
    key: 'face',
    label: 'Face Reading',
    ticketField: 'aiGuruTickets',
    costPerUse: 1,
    defaultProductId: '199',
  },
  palmistry: {
    key: 'palmistry',
    label: 'Palmistry',
    ticketField: 'aiGuruTickets',
    costPerUse: 1,
    defaultProductId: '199',
  },
  aura: {
    key: 'aura',
    label: 'Aura Scan',
    ticketField: 'aiGuruTickets',
    costPerUse: 1,
    defaultProductId: '199',
  },
  calendar: {
    key: 'calendar',
    label: 'Cosmic Calendar',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  rituals: {
    key: 'rituals',
    label: 'Vedic Rituals',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  planets: {
    key: 'planets',
    label: 'Planetary Positions',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  pregnancy: {
    key: 'pregnancy',
    label: 'Pregnancy Insights',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '299',
  },
  houses: {
    key: 'houses',
    label: '12 Houses',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  dasha: {
    key: 'dasha',
    label: 'Dasha Timeline',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  charts: {
    key: 'charts',
    label: 'Divisional Charts',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  predictions: {
    key: 'predictions',
    label: 'Predictions',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
  timeline: {
    key: 'timeline',
    label: 'Life Timeline',
    ticketField: 'lifetimePredictions',
    costPerUse: 1,
    defaultProductId: '199',
  },
}

/**
 * Get feature access configuration
 */
export function getFeatureAccess(key: FeatureKey): FeatureAccessConfig {
  return FEATURE_ACCESS[key]
}

/**
 * Get all feature keys
 */
export function getAllFeatureKeys(): FeatureKey[] {
  return Object.keys(FEATURE_ACCESS) as FeatureKey[]
}

