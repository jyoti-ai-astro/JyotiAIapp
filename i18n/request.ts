/**
 * Server-Side Locale Resolution
 * 
 * Extracts preferred locale from:
 * 1. Query parameters (?lang= or ?locale=)
 * 2. Cookies (NEXT_LOCALE or jyoti_locale)
 * 3. User profile / custom header
 * 4. Accept-Language header
 * 5. Default fallback ('en-IN')
 */

import { DEFAULT_LOCALE, normalizeLocale, type SupportedLocale } from './config'

export interface ServerLocaleContext {
  query?: Record<string, string | string[] | undefined> | URLSearchParams
  cookies?: Record<string, string | undefined> | { get: (name: string) => { value?: string } | undefined }
  headers?: Headers | Record<string, string | undefined>
  userPreferredLocale?: string | null
}

export function resolveServerLocale(ctx?: ServerLocaleContext): SupportedLocale {
  if (!ctx) return DEFAULT_LOCALE

  // 1. Check explicit user preference if passed
  if (ctx.userPreferredLocale) {
    return normalizeLocale(ctx.userPreferredLocale)
  }

  // 2. Check query parameter (?locale= or ?lang=)
  if (ctx.query) {
    let queryVal: string | undefined
    if (ctx.query instanceof URLSearchParams) {
      queryVal = ctx.query.get('locale') || ctx.query.get('lang') || undefined
    } else {
      const l = ctx.query['locale'] || ctx.query['lang']
      queryVal = Array.isArray(l) ? l[0] : l
    }
    if (queryVal) {
      return normalizeLocale(queryVal)
    }
  }

  // 3. Check cookies (NEXT_LOCALE or jyoti_locale)
  if (ctx.cookies) {
    let cookieVal: string | undefined
    if ('get' in ctx.cookies && typeof ctx.cookies.get === 'function') {
      cookieVal = ctx.cookies.get('NEXT_LOCALE')?.value || ctx.cookies.get('jyoti_locale')?.value
    } else {
      const record = ctx.cookies as Record<string, string | undefined>
      cookieVal = record['NEXT_LOCALE'] || record['jyoti_locale']
    }
    if (cookieVal) {
      return normalizeLocale(cookieVal)
    }
  }

  // 4. Check Accept-Language header
  if (ctx.headers) {
    let acceptLang: string | undefined
    if (ctx.headers instanceof Headers) {
      acceptLang = ctx.headers.get('accept-language') || undefined
    } else {
      acceptLang = ctx.headers['accept-language'] || ctx.headers['Accept-Language']
    }

    if (acceptLang) {
      // Parse weighted accept-language tokens
      const preferred = parseAcceptLanguage(acceptLang)
      if (preferred) {
        return normalizeLocale(preferred)
      }
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Parses Accept-Language header string e.g. "hi,en-US;q=0.9,en;q=0.8"
 */
function parseAcceptLanguage(header: string): string | null {
  const parts = header.split(',').map((p) => {
    const [tag, qPart] = p.trim().split(';q=')
    const quality = qPart ? parseFloat(qPart) : 1.0
    return { tag: tag.trim(), quality: isNaN(quality) ? 0 : quality }
  })

  // Sort by priority quality descending
  parts.sort((a, b) => b.quality - a.quality)

  for (const part of parts) {
    const lower = part.tag.toLowerCase()
    if (lower.startsWith('hi')) {
      return 'hi-IN'
    }
    if (lower.startsWith('en')) {
      return 'en-IN'
    }
    if (lower.startsWith('bn')) return 'bn-IN'
    if (lower.startsWith('mr')) return 'mr-IN'
    if (lower.startsWith('gu')) return 'gu-IN'
    if (lower.startsWith('ta')) return 'ta-IN'
    if (lower.startsWith('te')) return 'te-IN'
  }

  return parts[0]?.tag || null
}
