/**
 * JyotiAI Locale-Aware Formatters
 * 
 * Provides consistent Indian numbering (lakhs, crores), Indian Rupee (₹),
 * and localized date/time formatting.
 */

import { normalizeLocale, type SupportedLocale } from './config'

/**
 * Format a number using Indian numbering system for Indian locales
 */
export function formatNumber(
  value: number,
  locale?: string | null,
  options?: Intl.NumberFormatOptions
): string {
  const norm = normalizeLocale(locale)
  const intlLocale = norm === 'hi-Latn' ? 'en-IN' : norm

  try {
    return new Intl.NumberFormat(intlLocale, options).format(value)
  } catch {
    return value.toLocaleString('en-IN', options)
  }
}

/**
 * Format Indian Rupee (₹) amounts
 */
export function formatCurrency(
  amount: number,
  locale?: string | null,
  currency: string = 'INR'
): string {
  const norm = normalizeLocale(locale)
  const intlLocale = norm === 'hi-Latn' ? 'en-IN' : norm

  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`
  }
}

/**
 * Format a date in a locale-sensitive manner
 */
export function formatDate(
  date: Date | string | number,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'

  const norm = normalizeLocale(locale)
  const intlLocale = norm === 'hi-Latn' ? 'en-IN' : norm

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }

  try {
    return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(d)
  } catch {
    return d.toLocaleDateString('en-IN', defaultOptions)
  }
}

/**
 * Localized date-time formatting
 */
export function formatDateTime(
  date: Date | string | number,
  locale?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatDate(date, locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}
