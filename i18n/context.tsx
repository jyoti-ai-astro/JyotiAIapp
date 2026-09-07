'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALE_REGISTRY,
  WAVE_1_LOCALES,
  getAvailableLocales,
  normalizeLocale,
  type SupportedLocale,
  type LocaleMetadata,
} from './config'

import enCatalog from '../messages/en-IN.json'
import hiCatalog from '../messages/hi-IN.json'
import hiLatnCatalog from '../messages/hi-Latn.json'

type MessageCatalog = typeof enCatalog

const CATALOG_MAP: Record<string, MessageCatalog> = {
  'en-IN': enCatalog,
  'hi-IN': hiCatalog,
  'hi-Latn': hiLatnCatalog,
}

export interface I18nContextValue {
  locale: SupportedLocale
  setLocale: (newLocale: SupportedLocale | string) => void
  t: (key: string, params?: Record<string, any>) => string
  currentLocaleMeta: LocaleMetadata
  availableLocales: LocaleMetadata[]
}

const I18nContext = createContext<I18nContextValue | null>(null)

/**
 * Helper to resolve dot-notated keys inside JSON catalog
 */
function resolveKey(catalog: Record<string, any>, path: string): string | undefined {
  const parts = path.split('.')
  let current: any = catalog

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * Interpolate {param} in string templates
 */
function interpolate(template: string, params?: Record<string, any>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`
  })
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale?: string | null
}) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() =>
    normalizeLocale(initialLocale || DEFAULT_LOCALE)
  )

  // Initialize from storage or cookie on client
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('jyoti_locale')
      if (stored) {
        setLocaleState(normalizeLocale(stored))
        return
      }

      // Check cookie
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
      if (match && match[1]) {
        setLocaleState(normalizeLocale(match[1]))
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [])

  const setLocale = useCallback((newLoc: SupportedLocale | string) => {
    const normalized = normalizeLocale(newLoc)
    setLocaleState(normalized)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jyoti_locale', normalized)
        document.cookie = `NEXT_LOCALE=${normalized};path=/;max-age=31536000;SameSite=Lax`
        document.documentElement.lang = normalized
      } catch {
        // Safe fallback
      }
    }
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, any>): string => {
      const activeCatalog = CATALOG_MAP[locale] || CATALOG_MAP[FALLBACK_LOCALE]
      let value = resolveKey(activeCatalog, key)

      // Fallback to default English catalog if key missing in active locale
      if (value === undefined && locale !== FALLBACK_LOCALE) {
        const fallbackCatalog = CATALOG_MAP[FALLBACK_LOCALE]
        value = resolveKey(fallbackCatalog, key)
      }

      if (value === undefined) {
        return key
      }

      return interpolate(value, params)
    },
    [locale]
  )

  const currentLocaleMeta = useMemo(() => {
    return LOCALE_REGISTRY[locale] || LOCALE_REGISTRY[DEFAULT_LOCALE]
  }, [locale])

  const availableLocales = useMemo(() => {
    return getAvailableLocales()
  }, [])

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t,
      currentLocaleMeta,
      availableLocales,
    }),
    [locale, setLocale, t, currentLocaleMeta, availableLocales]
  )

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
}

/**
 * Hook to access translations and locale switching in components
 */
export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Graceful fallback for components used outside I18nProvider
    const fallbackT = (key: string, params?: Record<string, any>) => {
      const val = resolveKey(CATALOG_MAP[DEFAULT_LOCALE], key) || key
      return interpolate(val, params)
    }

    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: fallbackT,
      currentLocaleMeta: LOCALE_REGISTRY[DEFAULT_LOCALE],
      availableLocales: getAvailableLocales(),
    }
  }
  return ctx
}

/**
 * Lightweight hook to get current locale
 */
export function useLocale(): SupportedLocale {
  const { locale } = useTranslation()
  return locale
}

/**
 * Accessible language selector dropdown component
 */
export function LanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale, availableLocales } = useTranslation()

  return (
    <div className={`relative inline-block ${className}`}>
      <select
        aria-label="Select Language"
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="appearance-none cursor-pointer rounded-full border border-[#d7aa57]/30 bg-[#030b10]/80 px-3 py-1 text-xs font-medium text-[#fff7e8] transition-colors hover:border-[#d7aa57]/60 focus:outline-none focus:ring-1 focus:ring-[#d7aa57]"
      >
        {availableLocales.map((loc) => (
          <option key={loc.code} value={loc.code} className="bg-[#030b10] text-[#fff7e8]">
            {loc.nativeName} ({loc.name})
          </option>
        ))}
      </select>
    </div>
  )
}
