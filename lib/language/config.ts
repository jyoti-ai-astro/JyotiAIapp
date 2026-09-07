/**
 * Language Subsystem Configuration & Feature Flags
 */

import { DEFAULT_LOCALE, type SupportedLocale } from '../../i18n/config'

/**
 * Feature flag controlling active multilingual features.
 * Checked via NEXT_PUBLIC_I18N_BETA_ENABLED or I18N_BETA_ENABLED.
 */
export const I18N_BETA_ENABLED: boolean =
  process.env.NEXT_PUBLIC_I18N_BETA_ENABLED === 'true' ||
  process.env.I18N_BETA_ENABLED === 'true'

export interface LanguageGatewayConfig {
  defaultLocale: SupportedLocale
  enableCodeMixDetection: boolean
  enableGlossaryPreservation: boolean
  preferHinglishForRomanHindi: boolean
  maxHistoryTurnsToInspect: number
}

export const DEFAULT_LANGUAGE_GATEWAY_CONFIG: LanguageGatewayConfig = {
  defaultLocale: DEFAULT_LOCALE,
  enableCodeMixDetection: true,
  enableGlossaryPreservation: true,
  preferHinglishForRomanHindi: true,
  maxHistoryTurnsToInspect: 5,
}
