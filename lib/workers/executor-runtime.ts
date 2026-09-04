export const DEFAULT_EXECUTOR_BATCH_SIZE = 5
export const MAX_EXECUTOR_BATCH_SIZE = 10
export const DEFAULT_TIMEZONE = 'Asia/Kolkata'

export interface ExecutorOptions {
  cursor?: string | null
  batchSize?: number
  now?: Date
}

export interface ExecutorResult {
  processed: number
  skipped: number
  errors: number
  failedItemIds: string[]
  hasMore: boolean
  nextCursor: string | null
}

export function normalizeBatchSize(value?: number): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_EXECUTOR_BATCH_SIZE
  }

  return Math.max(
    1,
    Math.min(MAX_EXECUTOR_BATCH_SIZE, Math.floor(value as number))
  )
}

export function normalizeTimezone(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return DEFAULT_TIMEZONE
  }

  const timezone = value.trim()

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date())
    return timezone
  } catch {
    return DEFAULT_TIMEZONE
  }
}

export function getCalendarDateKey(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: normalizeTimezone(timezone),
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

export function getNextCalendarDateKey(date: Date, timezone: string): string {
  const localKey = getCalendarDateKey(date, timezone)
  const [year, month, day] = localKey.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + 1, 12, 0, 0))

  return getCalendarDateKey(next, 'UTC')
}

export function localHourToUtcDate(
  calendarKey: string,
  hour: number,
  timezone: string
): Date {
  const normalizedTimezone = normalizeTimezone(timezone)
  const [year, month, day] = calendarKey.split('-').map(Number)

  let candidate = new Date(Date.UTC(year, month - 1, day, hour, 0, 0))

  for (let iteration = 0; iteration < 4; iteration++) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizedTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(candidate)

    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value])
    )

    const observed = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      0,
      0
    )

    const desired = Date.UTC(year, month - 1, day, hour, 0, 0)
    const adjustment = desired - observed

    if (adjustment === 0) {
      return candidate
    }

    candidate = new Date(candidate.getTime() + adjustment)
  }

  return candidate
}
