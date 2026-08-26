export type AstrologyDisplayValue =
  | string
  | number
  | null
  | undefined
  | {
      nakshatra?: unknown
      name?: unknown
      label?: unknown
      pada?: unknown
    }

export function formatAstrologyDisplayValue(
  value: unknown,
  fallback = 'Not available'
): string {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed && trimmed !== 'Unknown' ? trimmed : fallback
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : fallback
  }

  return fallback
}

export function formatNakshatraDisplay(value: unknown, fallback = 'Not available'): string {
  const direct = formatAstrologyDisplayValue(value, '')
  if (direct) return direct

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return fallback
  }

  const record = value as Record<string, unknown>
  const name =
    formatAstrologyDisplayValue(record.nakshatra, '') ||
    formatAstrologyDisplayValue(record.name, '') ||
    formatAstrologyDisplayValue(record.label, '')

  if (!name) return fallback

  const rawPada = record.pada
  if (typeof rawPada === 'number' && Number.isFinite(rawPada) && rawPada > 0) {
    return `${name} · Pada ${rawPada}`
  }

  const pada = formatAstrologyDisplayValue(rawPada, '')
  return pada && pada !== '0' ? `${name} · Pada ${pada}` : name
}

export function nullableAstrologyDisplay(value: unknown): string | null {
  const formatted = formatAstrologyDisplayValue(value, '')
  return formatted || null
}

export function nullableNakshatraDisplay(value: unknown): string | null {
  const formatted = formatNakshatraDisplay(value, '')
  return formatted || null
}
